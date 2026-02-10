'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTemplates, setPage, incrementTemplateUsage } from '@/store/slices/templatesSlice';
import {
  setSelectedTemplate,
  resetGeneration,
  generateImage,
  checkGenerationStatus,
  setProgress,
} from '@/store/slices/generationSlice';
import { checkSubscription } from '@/store/slices/subscriptionSlice';
import Navbar from '@/components/Navbar';
import TemplateCard from '@/components/TemplateCard';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import Alert from '@/components/Alert';
import DevModeIndicator from '@/components/DevModeIndicator';
import ImageUploadModal from '@/components/modals/ImageUploadModal';
import SubscriptionModal from '@/components/modals/SubscriptionModal';
import PaymentModal from '@/components/modals/PaymentModal';
import PaymentWaitingModal from '@/components/modals/PaymentWaitingModal';
import GenerationModal from '@/components/modals/GenerationModal';
import ResultModal from '@/components/modals/ResultModal';
import { expandTelegramWebApp, getTelegramUser, getTelegramWebApp, isInvoiceSupported } from '@/utils/telegram';
import api from '@/services/api';

type ModalStep = 'closed' | 'upload' | 'subscription' | 'checking' | 'payment' | 'payment_waiting' | 'generating' | 'result';

export default function Home() {
  const dispatch = useAppDispatch();
  const [modalStep, setModalStep] = useState<ModalStep>('closed');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stars' | 'click' | null>(null);
  const [currentGenerationRequestId, setCurrentGenerationRequestId] = useState<number | null>(null);

  const { templates, currentPage, totalPages, itemsPerPage, loading } = useAppSelector(
    (state) => state.templates
  );
  const {
    selectedTemplateId,
    uploadedImages,
    generationStatus,
    progress,
    resultImageUrl,
  } = useAppSelector((state) => state.generation);
  const { isSubscribed, requiresPayment } = useAppSelector((state) => state.subscription);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const telegramUser = mounted ? getTelegramUser() : null;

  useEffect(() => {
    setMounted(true);
    expandTelegramWebApp();
    dispatch(fetchTemplates({ page: 1, limit: itemsPerPage }));
  }, [dispatch, itemsPerPage]);

  useEffect(() => {
    // Debug: Log Telegram user info (only on client side)
    if (mounted && process.env.NODE_ENV === 'development') {
      console.log('Telegram User:', telegramUser);
      console.log('Is Telegram WebApp:', typeof window !== 'undefined' && !!window.Telegram?.WebApp);
    }
  }, [mounted, telegramUser]);

  const handleTemplateClick = (templateId: number) => {
    dispatch(setSelectedTemplate(templateId));
    setModalStep('upload');
  };

  const handleCloseModal = () => {
    setModalStep('closed');
    dispatch(resetGeneration());
    setSelectedPaymentMethod(null);
    setCurrentGenerationRequestId(null);
    setPaymentLoading(false);
  };

  const handleProceedFromUpload = () => {
    setModalStep('checking');
    handleCheckSubscription();
  };

  const handleCheckSubscription = async () => {
    // Development mode: use test user if Telegram user not available
    const userId = telegramUser?.id || 1046805799; // Test user ID for development

    if (!telegramUser && process.env.NODE_ENV === 'production') {
      showAlertMessage('Iltimos, Telegram bot orqali oching');
      setModalStep('upload');
      return;
    }

    if (!selectedTemplateId) {
      showAlertMessage('Template tanlanmagan');
      setModalStep('upload');
      return;
    }

    try {
      const result = await dispatch(
        checkSubscription({ userId, templateId: selectedTemplateId })
      ).unwrap();

      // Debug log
      if (process.env.NODE_ENV === 'development') {
        console.log('Subscription check result:', {
          requires_payment: result.requires_payment,
          subscribed: result.subscribed,
          sponsors_count: result.sponsors?.length || 0,
          price_stars: result.template_price?.price_stars,
          price_uzs: result.template_price?.price_uzs,
        });
      }

      // Birinchi to'lov kerakligini tekshiramiz
      if (result.requires_payment) {
        // To'lov modal ko'rsatish
        setModalStep('payment');
      }
      // Agar to'lov kerak bo'lmasa, lekin kanallar bor (subscribed to bo'lmagan)
      else if (!result.subscribed || (result.sponsors && result.sponsors.length > 0)) {
        // SubGram kanallar modalini ko'rsatish
        setModalStep('subscription');
      }
      // Faqat ikkala shart ham bajarilsa generatsiya boshlaydi:
      // 1. To'lov kerak emas (requires_payment: false)
      // 2. Obuna tasdiqlangan (subscribed: true) va kanallar yo'q
      else {
        setModalStep('generating');
        await handleStartGeneration();
      }
    } catch (error) {
      console.error('Subscription check error:', error);
      showAlertMessage('Obunani tekshirishda xatolik');
      setModalStep('upload');
    }
  };

  const handleSelectPaymentMethod = async (method: 'stars' | 'click') => {
    setSelectedPaymentMethod(method);
    setPaymentLoading(true);

    const userId = telegramUser?.id || 1046805799;

    if (!selectedTemplateId) {
      showAlertMessage('Template tanlanmagan');
      setPaymentLoading(false);
      return;
    }

    try {
      // Step 1: Upload images and create generation request (with payment_verified=false)
      const files = uploadedImages.map((img) => img.file);
      const generationResult = await api.generateImage(
        selectedTemplateId,
        userId,
        files,
        false // payment_verified = false
      );

      if (generationResult.status === 'error') {
        throw new Error(generationResult.error || 'Generation failed');
      }

      if (!generationResult.request_id) {
        throw new Error('Generation request ID not received');
      }

      setCurrentGenerationRequestId(generationResult.request_id);

      // Step 2: Create payment
      const paymentResult = await api.createPayment(
        userId,
        selectedTemplateId,
        generationResult.request_id,
        method
      );

      if (paymentResult.status !== 'success') {
        throw new Error('Payment creation failed');
      }

      // Step 3: Open payment UI
      if (method === 'stars' && paymentResult.invoice_url) {
        // Check if Stars payment is supported
        if (!isInvoiceSupported()) {
          const tg = getTelegramWebApp();
          const version = tg?.version || 'unknown';

          showAlertMessage(
            `Telegram ilovangiz eskiroq (v${version}). Stars to'lovi uchun Telegram'ni yangilang (v6.1+) yoki Click orqali to'lang.`
          );
          setPaymentLoading(false);
          setModalStep('payment');
          return;
        }

        // Open Telegram Stars invoice
        const tg = getTelegramWebApp();
        if (tg && tg.openInvoice) {
          setModalStep('payment_waiting');
          setPaymentLoading(false);

          if (process.env.NODE_ENV === 'development') {
            console.log('⭐ Opening Stars invoice:', paymentResult.invoice_url);
            console.log('⭐ Telegram version:', tg.version);
          }

          // Use invoice_url (not payload!)
          tg.openInvoice(paymentResult.invoice_url, (status) => {
            if (status === 'paid') {
              handlePaymentSuccess();
            } else if (status === 'cancelled') {
              setPaymentLoading(false);
              showAlertMessage('To\'lov bekor qilindi');
              setModalStep('payment');
            } else if (status === 'failed') {
              setPaymentLoading(false);
              showAlertMessage('To\'lov xatosi');
              setModalStep('payment');
            }
          });
        } else {
          showAlertMessage('Telegram WebApp mavjud emas. Brauzerda test qilyapsizmi?');
          setPaymentLoading(false);
          setModalStep('payment');
        }
      } else if (method === 'stars' && !paymentResult.invoice_url) {
        // Backend invoice_url qaytarmagan
        throw new Error('Invoice URL not received from backend');
      } else if (method === 'click' && paymentResult.payment_url) {
        // Open Click payment in new window
        const paymentWindow = window.open(paymentResult.payment_url, '_blank');
        if (!paymentWindow) {
          showAlertMessage('Popup blocker o\'chirilgan. Iltimos, ruxsat bering.');
        }
        setModalStep('payment_waiting');
        setPaymentLoading(false);
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (error: any) {
      console.error('Payment creation error:', error);
      showAlertMessage(error.message || 'To\'lov yaratishda xatolik');
      setPaymentLoading(false);
      setModalStep('payment');
    }
  };

  const handlePaymentSuccess = async () => {
    // ⭐ STARS: Called when Stars payment is successful via invoice callback
    if (!currentGenerationRequestId) {
      showAlertMessage('Generation request topilmadi');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('⭐ Stars payment success, calling confirm-payment...', {
        generationRequestId: currentGenerationRequestId,
      });
    }

    setPaymentLoading(true);

    try {
      // FAQAT STARS UCHUN: confirm-payment chaqiramiz
      const confirmResult = await api.confirmPayment(
        currentGenerationRequestId,
        'stars'
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('⭐ Stars confirm-payment result:', confirmResult);
      }

      if (confirmResult.status === 'success') {
        // Stars to'lov tasdiqlandi, generatsiya boshlanadi
        setModalStep('generating');
        setPaymentLoading(false);
        dispatch(setProgress(10));
        pollGenerationStatus(currentGenerationRequestId);
      } else {
        showAlertMessage('Stars to\'lovni tasdiqlashda xatolik');
        setPaymentLoading(false);
        setModalStep('payment');
      }
    } catch (error: any) {
      console.error('Stars payment confirmation error:', error);
      showAlertMessage(error.message || 'To\'lovni tasdiqlashda xatolik');
      setPaymentLoading(false);
      setModalStep('payment');
    }
  };

  const checkPaymentAndGenerate = async () => {
    // 💳 CLICK: Faqat status tekshiramiz, confirm-payment CHAQIRILMAYDI
    // Webhook allaqachon generatsiyani boshlagan bo'lishi kerak
    if (!currentGenerationRequestId) {
      showAlertMessage('Generation request topilmadi');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('💳 Click payment check started, polling status...', {
        generationRequestId: currentGenerationRequestId,
        note: 'confirm-payment NOT called for Click',
      });
    }

    setPaymentLoading(true);

    try {
      // Status tekshirish
      const statusResult = await api.getGenerationStatus(currentGenerationRequestId);

      if (process.env.NODE_ENV === 'development') {
        console.log('💳 Click status check result:', statusResult);
      }

      if (
        statusResult.status === 'PENDING' ||
        statusResult.status === 'PROCESSING' ||
        statusResult.status === 'COMPLETED'
      ) {
        // ✅ Webhook ishlagan! Generatsiya boshlangan
        setModalStep('generating');
        setPaymentLoading(false);
        dispatch(setProgress(10));
        pollGenerationStatus(currentGenerationRequestId);
      } else if (statusResult.status === 'WAITING_PAYMENT') {
        // ⏳ Webhook hali kelmagan, 3 soniyadan keyin qayta tekshiramiz
        showAlertMessage('To\'lov kutilmoqda. Iltimos, biroz kuting...');
        setPaymentLoading(false);
        setTimeout(() => {
          checkPaymentAndGenerate();
        }, 3000);
      } else if (statusResult.status === 'FAILED') {
        showAlertMessage(statusResult.error || 'To\'lov amalga oshmadi');
        setPaymentLoading(false);
        setModalStep('payment');
      } else {
        showAlertMessage('To\'lov holati noma\'lum. Qayta urinib ko\'ring');
        setPaymentLoading(false);
        setModalStep('payment');
      }
    } catch (error: any) {
      console.error('Click payment check error:', error);
      showAlertMessage(error.message || 'Holatni tekshirishda xatolik');
      setPaymentLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setSelectedPaymentMethod(null);
    setCurrentGenerationRequestId(null);
    setPaymentLoading(false);
    setModalStep('payment');
  };

  const handleStartGeneration = async () => {
    // For free generation (after subscription verification)
    const userId = telegramUser?.id || 1046805799;

    if (!selectedTemplateId) {
      showAlertMessage('Ma\'lumotlar topilmadi');
      return;
    }

    try {
      const files = uploadedImages.map((img) => img.file);
      // Generate with payment_verified = true (free)
      const result = await api.generateImage(
        selectedTemplateId,
        userId,
        files,
        true // payment_verified = true for free generation
      );

      if (result.status === 'generating' && result.request_id) {
        dispatch(setProgress(10));
        pollGenerationStatus(result.request_id);
      } else if (result.status === 'error') {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      showAlertMessage(error.message || 'Xatolik yuz berdi');
      handleCloseModal();
    }
  };

  const pollGenerationStatus = async (requestId: number) => {
    let attempts = 0;
    const maxAttempts = 60;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        showAlertMessage('Vaqt tugadi. Qayta urinib ko\'ring');
        handleCloseModal();
        return;
      }

      try {
        const result = await dispatch(checkGenerationStatus(requestId)).unwrap();

        if (result.status === 'COMPLETED') {
          dispatch(setProgress(100));
          if (selectedTemplateId) {
            dispatch(incrementTemplateUsage(selectedTemplateId));
          }
          setTimeout(() => {
            setModalStep('result');
          }, 500);
        } else if (result.status === 'FAILED') {
          showAlertMessage(result.error || 'Generatsiya xatosi');
          handleCloseModal();
        } else {
          dispatch(setProgress(Math.min(40 + attempts * 5, 90)));
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Poll error:', error);
        attempts++;
        setTimeout(poll, 3000);
      }
    };

    await poll();
  };

  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    dispatch(setPage(newPage));
    dispatch(fetchTemplates({ page: newPage, limit: itemsPerPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center space-y-4 sm:space-y-6 animate-fade-in-up">
          <h1 className="font-mono font-bold text-4xl sm:text-5xl md:text-7xl">
            <span className="text-accent">Tasvir</span> AI
          </h1>
          <p className="text-secondary-text text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
            Professional templates bilan bir lahzada noyob rasmlar yarating
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading && templates.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 loader rounded-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleTemplateClick(template.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() => handlePageChange('prev')}
                onNext={() => handlePageChange('next')}
              />
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalStep !== 'closed'} onClose={handleCloseModal}>
        {modalStep === 'upload' && (
          <ImageUploadModal onProceed={handleProceedFromUpload} />
        )}
        {(modalStep === 'checking' || modalStep === 'subscription') && (
          <SubscriptionModal
            onCheck={handleCheckSubscription}
            onBack={() => setModalStep('upload')}
          />
        )}
        {modalStep === 'payment' && (
          <PaymentModal
            onSelectPayment={handleSelectPaymentMethod}
            onBack={() => setModalStep('upload')}
            loading={paymentLoading}
          />
        )}
        {modalStep === 'payment_waiting' && selectedPaymentMethod && (
          <PaymentWaitingModal
            paymentMethod={selectedPaymentMethod}
            onCheckPayment={checkPaymentAndGenerate}
            onCancel={handleCancelPayment}
            loading={paymentLoading}
          />
        )}
        {modalStep === 'generating' && <GenerationModal progress={progress} />}
        {modalStep === 'result' && resultImageUrl && selectedTemplate && (
          <ResultModal
            imageUrl={resultImageUrl}
            templateTitle={selectedTemplate.title}
            onClose={handleCloseModal}
          />
        )}
      </Modal>

      {/* Alert */}
      <Alert
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      />

      {/* Development Mode Indicator */}
      <DevModeIndicator />
    </>
  );
}
