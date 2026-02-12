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
import TemplateCardSkeleton from '@/components/TemplateCardSkeleton';
import EmptyState from '@/components/EmptyState';
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
import { expandTelegramWebApp, getTelegramUser, getTelegramWebApp, isInvoiceSupported, buildErrorReport, collectTelegramInfo, type ErrorDetails } from '@/utils/telegram';
import api from '@/services/api';

type ModalStep = 'closed' | 'upload' | 'subscription' | 'checking' | 'payment' | 'payment_waiting' | 'generating' | 'result';

export default function Home() {
  const dispatch = useAppDispatch();
  const [modalStep, setModalStep] = useState<ModalStep>('closed');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [alertErrorDetail, setAlertErrorDetail] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stars' | 'click' | null>(null);
  const [currentGenerationRequestId, setCurrentGenerationRequestId] = useState<number | null>(null);
  const [currentGateway, setCurrentGateway] = useState<'CLICK' | 'STARS' | 'SUBGRAM' | 'FREE'>('FREE');

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
    setCurrentGateway('FREE');
    setPaymentLoading(false);
  };

  const handleProceedFromUpload = () => {
    setModalStep('checking');
    handleCheckSubscription();
  };

  const handleCheckSubscription = async () => {
    // Development mode: use test user if Telegram user not available
    const userId = telegramUser?.id || 1046805799; // Test user ID for development

    // Telegram check disabled for testing
    // if (!telegramUser && process.env.NODE_ENV === 'production') {
    //   showAlertMessage('Iltimos, Telegram bot orqali oching');
    //   setModalStep('upload');
    //   return;
    // }

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
          has_free_images: result.has_free_images,
          gateway: result.gateway,
          sponsors_count: result.sponsors?.length || 0,
          price_stars: result.template_price?.price_stars,
          price_uzs: result.template_price?.price_uzs,
        });
      }

      // 1. Free image bor → to'g'ridan-to'g'ri generate
      if (result.has_free_images) {
        setCurrentGateway('FREE');
        setModalStep('generating');
        await handleStartGeneration();
        return;
      }

      // 2. SubGram kanallar bor → obuna modal
      if (!result.requires_payment && result.sponsors && result.sponsors.length > 0) {
        setCurrentGateway('SUBGRAM');
        setModalStep('subscription');
        return;
      }

      // 3. To'lov kerak → payment modal
      if (result.requires_payment) {
        setModalStep('payment');
        return;
      }

      // 4. Hech narsa kerak emas (edge case) → generate
      setCurrentGateway((result.gateway as typeof currentGateway) || 'FREE');
      setModalStep('generating');
      await handleStartGeneration();
    } catch (error) {
      console.error('Subscription check error:', error);
      showAlertMessage('Obunani tekshirishda xatolik', 'error');
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

      console.log('📸 Starting generation request...', {
        templateId: selectedTemplateId,
        userId,
        filesCount: files.length,
      });

      const generationResult = await api.generateImage(
        selectedTemplateId,
        userId,
        files,
        false, // payment_verified = false
        method === 'stars' ? 'STARS' : 'CLICK'
      );

      console.log('📸 Generation result:', generationResult);

      if (generationResult.status === 'error') {
        throw new Error(generationResult.error || 'Generation failed');
      }

      if (!generationResult.request_id) {
        throw new Error('Generation request ID not received');
      }

      setCurrentGenerationRequestId(generationResult.request_id);

      // Step 2: Create payment
      console.log('💳 Creating payment...', {
        userId,
        templateId: selectedTemplateId,
        generationRequestId: generationResult.request_id,
        method,
        apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      });

      let paymentResult;
      try {
        paymentResult = await api.createPayment(
          userId,
          selectedTemplateId,
          generationResult.request_id,
          method
        );
        console.log('💳 Payment result:', paymentResult);
      } catch (paymentError: any) {
        console.error('💳 Payment creation failed:', {
          message: paymentError.message,
          response: paymentError.response?.data,
          status: paymentError.response?.status,
          url: paymentError.config?.url,
        });
        throw new Error(paymentError.message || 'To\'lov yaratishda xatolik');
      }

      // Check if payment creation was successful (more flexible check)
      if (!paymentResult || (paymentResult.status && paymentResult.status === 'error')) {
        console.error('❌ Payment creation failed:', paymentResult);
        throw new Error(paymentResult?.message || 'Payment creation failed');
      }

      // Step 3: Open payment UI
      if (method === 'stars') {
        // Stars payment flow
        if (!paymentResult.invoice_url) {
          console.error('❌ Invoice URL missing:', paymentResult);
          throw new Error('Invoice URL not received from backend');
        }
        console.log('⭐ Stars payment - checking Telegram support...');

        // Check if Stars payment is supported
        if (!isInvoiceSupported()) {
          const tg = getTelegramWebApp();
          const version = tg?.version || 'unknown';

          console.warn('⭐ Stars not supported, Telegram version:', version);
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
          console.log('⭐ Opening Stars invoice:', paymentResult.invoice_url);
          console.log('⭐ Telegram version:', tg.version);

          setModalStep('payment_waiting');
          setPaymentLoading(false);

          // Use invoice_url (not payload!)
          tg.openInvoice(paymentResult.invoice_url, (status) => {
            console.log('⭐ Invoice callback status:', status);

            if (status === 'paid') {
              console.log('⭐ Payment successful!');
              handlePaymentSuccess();
            } else if (status === 'cancelled') {
              console.log('⭐ Payment cancelled');
              setPaymentLoading(false);
              showAlertMessage('To\'lov bekor qilindi');
              setModalStep('payment');
            } else if (status === 'failed') {
              console.error('⭐ Payment failed');
              setPaymentLoading(false);
              showAlertMessage('To\'lov xatosi');
              setModalStep('payment');
            } else if (status === 'pending') {
              console.log('⭐ Payment pending, waiting...');
              // Keep waiting
            }
          });
        } else {
          console.error('⭐ Telegram WebApp not available');
          showAlertMessage('Telegram WebApp mavjud emas. Brauzerda test qilyapsizmi?');
          setPaymentLoading(false);
          setModalStep('payment');
        }
      } else if (method === 'click') {
        // Click payment flow
        if (!paymentResult.payment_url) {
          console.error('❌ Payment URL missing for Click:', paymentResult);
          throw new Error('Payment URL not received from backend');
        }

        const clickPaymentUrl = paymentResult.payment_url as string;
        console.log('💳 Opening Click payment URL:', clickPaymentUrl);

        // Use Telegram's openLink to open in external browser (no popup blocker issues)
        const tg = getTelegramWebApp();
        if (tg && typeof tg.openLink === 'function') {
          tg.showConfirm('Click orqali to\'lov sahifasiga o\'tasizmi?', (confirmed) => {
            if (confirmed) {
              tg.openLink(clickPaymentUrl);
              setModalStep('payment_waiting');
            }
            setPaymentLoading(false);
          });
        } else {
          // Fallback for non-Telegram browsers
          window.open(clickPaymentUrl, '_blank');
          setModalStep('payment_waiting');
          setPaymentLoading(false);
        }
      } else {
        console.error('❌ Invalid payment method or response:', { method, paymentResult });
        throw new Error('Invalid payment response');
      }
    } catch (error: any) {
      console.error('❌ Payment creation error:', error);

      // Collect full error details for debugging
      const tgInfo = collectTelegramInfo();
      const errorDetails: ErrorDetails = {
        url: error.config?.url || '/api/v1/create-payment',
        method: error.config?.method?.toUpperCase() || 'POST',
        status: error.response?.status || error.code || 'Network Error',
        message: error.message || 'Unknown error',
        code: error.code,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        ...tgInfo,
      };

      const errorReport = buildErrorReport(errorDetails);
      console.error('❌ Error report:\n', errorReport);

      // Show more detailed error message
      let errorMessage = 'To\'lov yaratishda xatolik';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'So\'rov vaqti tugadi. Qayta urinib ko\'ring.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Backend\'ga ulanib bo\'lmadi. Internet tekshiring.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error with copy-able detail
      showAlertMessage(errorMessage, 'error', errorReport);
      setPaymentLoading(false);
      setModalStep('payment');
    }
  };

  const handlePaymentSuccess = async () => {
    // ⭐ STARS: Called when Stars payment is successful via invoice callback
    console.log('⭐ handlePaymentSuccess called');

    if (!currentGenerationRequestId) {
      console.error('⭐ No generation request ID found');
      showAlertMessage('Generation request topilmadi');
      return;
    }

    console.log('⭐ Stars payment success, calling confirm-payment...', {
      generationRequestId: currentGenerationRequestId,
    });

    setPaymentLoading(true);

    try {
      // FAQAT STARS UCHUN: confirm-payment chaqiramiz
      const confirmResult = await api.confirmPayment(
        currentGenerationRequestId,
        'stars'
      );

      console.log('⭐ Stars confirm-payment result:', confirmResult);

      // More flexible status check
      if (confirmResult && (confirmResult.status === 'success' || confirmResult.message?.includes('success'))) {
        console.log('⭐ Payment confirmed! Starting generation...');
        // Stars to'lov tasdiqlandi, generatsiya boshlanadi
        setModalStep('generating');
        setPaymentLoading(false);
        dispatch(setProgress(10));
        pollGenerationStatus(currentGenerationRequestId);
      } else {
        console.error('⭐ Confirm payment failed:', confirmResult);
        showAlertMessage(confirmResult?.message || 'Stars to\'lovni tasdiqlashda xatolik', 'error');
        setPaymentLoading(false);
        setModalStep('payment');
      }
    } catch (error: any) {
      console.error('⭐ Stars payment confirmation error:', error);
      showAlertMessage(error.message || 'To\'lovni tasdiqlashda xatolik', 'error');
      setPaymentLoading(false);
      setModalStep('payment');
    }
  };

  const checkPaymentAndGenerate = async () => {
    // 💳 CLICK: Faqat status tekshiramiz, confirm-payment CHAQIRILMAYDI
    // Webhook allaqachon generatsiyani boshlagan bo'lishi kerak
    console.log('💳 checkPaymentAndGenerate called');

    if (!currentGenerationRequestId) {
      console.error('💳 No generation request ID found');
      showAlertMessage('Generation request topilmadi');
      return;
    }

    console.log('💳 Click payment check started, polling status...', {
      generationRequestId: currentGenerationRequestId,
      note: 'confirm-payment NOT called for Click',
    });

    setPaymentLoading(true);

    try {
      // Status tekshirish
      const statusResult = await api.getGenerationStatus(currentGenerationRequestId);

      console.log('💳 Click status check result:', statusResult);

      if (
        statusResult.status === 'PENDING' ||
        statusResult.status === 'PROCESSING' ||
        statusResult.status === 'COMPLETED'
      ) {
        // ✅ Webhook ishlagan! Generatsiya boshlangan
        console.log('💳 Payment confirmed by webhook! Starting generation...');
        console.log('💳 Current generation request ID:', currentGenerationRequestId);

        setModalStep('generating');
        setPaymentLoading(false);
        dispatch(setProgress(10));

        // If already completed, might need to handle immediately
        if (statusResult.status === 'COMPLETED') {
          console.log('💳 Already COMPLETED! Image URL:', statusResult.image_url);
          if (statusResult.image_url) {
            // Update Redux state directly
            dispatch(checkGenerationStatus(currentGenerationRequestId));
            // Show result immediately
            setTimeout(() => {
              setModalStep('result');
            }, 500);
          } else {
            console.error('❌ COMPLETED but no image_url!');
            showAlertMessage('Rasm topilmadi');
            setModalStep('payment');
          }
        } else {
          // Start polling
          pollGenerationStatus(currentGenerationRequestId);
        }
      } else if (statusResult.status === 'WAITING_PAYMENT' || statusResult.status === 'awaiting_payment') {
        // ⏳ Webhook hali kelmagan, 3 soniyadan keyin qayta tekshiramiz
        console.log('💳 Still waiting for payment webhook, checking again in 3s...');
        showAlertMessage('To\'lov kutilmoqda. Iltimos, biroz kuting...');
        setPaymentLoading(false);
        setTimeout(() => {
          checkPaymentAndGenerate();
        }, 3000);
      } else if (statusResult.status === 'FAILED' || statusResult.status === 'error') {
        console.error('💳 Payment failed:', statusResult);
        showAlertMessage(statusResult.error || statusResult.message || 'To\'lov amalga oshmadi');
        setPaymentLoading(false);
        setModalStep('payment');
      } else {
        console.warn('💳 Unknown payment status:', statusResult.status);
        showAlertMessage(`To'lov holati: ${statusResult.status}. Qayta urinib ko'ring`);
        setPaymentLoading(false);
        setModalStep('payment');
      }
    } catch (error: any) {
      console.error('💳 Click payment check error:', error);
      showAlertMessage(error.message || 'Holatni tekshirishda xatolik', 'error');
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
      // Generate with payment_verified = true (free/subgram)
      const result = await api.generateImage(
        selectedTemplateId,
        userId,
        files,
        true, // payment_verified = true for free generation
        currentGateway
      );

      if (result.status === 'generating' && result.request_id) {
        dispatch(setProgress(10));
        pollGenerationStatus(result.request_id);
      } else if (result.status === 'error') {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      showAlertMessage(error.message || 'Xatolik yuz berdi', 'error');
      handleCloseModal();
    }
  };

  const pollGenerationStatus = async (requestId: number) => {
    console.log('🔄 Starting pollGenerationStatus for request:', requestId);
    let attempts = 0;
    const maxAttempts = 60;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.error('🔄 Max attempts reached, timing out');
        showAlertMessage('Vaqt tugadi. Qayta urinib ko\'ring');
        handleCloseModal();
        return;
      }

      try {
        console.log(`🔄 Polling attempt ${attempts + 1}/${maxAttempts}`);
        const result = await dispatch(checkGenerationStatus(requestId)).unwrap();

        console.log('🔄 Status check result:', {
          status: result.status,
          image_url: result.image_url,
          request_id: result.request_id,
          error: result.error,
        });

        if (result.status === 'COMPLETED') {
          console.log('✅ Generation COMPLETED!');
          console.log('✅ Image URL:', result.image_url);
          console.log('✅ Selected Template ID:', selectedTemplateId);

          dispatch(setProgress(100));

          if (selectedTemplateId) {
            dispatch(incrementTemplateUsage(selectedTemplateId));
          }

          // Check if image_url exists
          if (!result.image_url) {
            console.error('❌ No image_url in completed result!');
            showAlertMessage('Rasm URL topilmadi');
            handleCloseModal();
            return;
          }

          console.log('✅ Switching to result modal...');
          setTimeout(() => {
            setModalStep('result');
          }, 500);
        } else if (result.status === 'FAILED' || result.status === 'error') {
          const rawError = result.error || result.message || 'Generatsiya xatosi';
          console.error('❌ Generation FAILED:', rawError);
          showAlertMessage(translateError(rawError), 'error', rawError);
          handleCloseModal();
        } else {
          console.log(`⏳ Status: ${result.status}, continuing to poll...`);
          dispatch(setProgress(Math.min(40 + attempts * 5, 90)));
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error: any) {
        console.error('❌ Poll error:', error);
        attempts++;
        setTimeout(poll, 3000);
      }
    };

    await poll();
  };

  const translateError = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (lower.includes('sexual') || (lower.includes('safety') && lower.includes('sexual'))) {
      return 'Yuklangan rasm xavfsizlik tekshiruvidan o\'tmadi. Rasmlarda ochiq sahnalar yo\'qligiga ishonch hosil qiling va qayta urinib ko\'ring.';
    }
    if (lower.includes('moderation_blocked') || lower.includes('safety_violation') || lower.includes('safety system')) {
      return 'Yuklangan rasm xavfsizlik tekshiruvidan o\'tmadi. Iltimos, boshqa rasm yuklang.';
    }
    if (lower.includes('rate_limit') || lower.includes('rate limit')) {
      return 'So\'rovlar limiti tugadi. Biroz kutib qayta urinib ko\'ring.';
    }
    if (lower.includes('invalid_image') || lower.includes('could not process')) {
      return 'Rasm formati noto\'g\'ri yoki buzilgan. Boshqa rasm yuklang.';
    }
    if (lower.includes('timeout') || lower.includes('timed out')) {
      return 'Rasm yaratish vaqti tugadi. Qayta urinib ko\'ring.';
    }
    if (lower.includes('billing') || lower.includes('quota')) {
      return 'Tizimda vaqtinchalik muammo. Keyinroq urinib ko\'ring.';
    }
    return raw;
  };

  const showAlertMessage = (message: string, type: 'success' | 'error' = 'success', errorDetail?: string) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertErrorDetail(errorDetail);
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
          // Show skeleton loaders while loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <TemplateCardSkeleton key={index} />
            ))}
          </div>
        ) : !loading && templates.length === 0 ? (
          // Show empty state when no templates
          <EmptyState />
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
        {modalStep === 'result' && (() => {
          console.log('🖼️ Result modal check:', {
            modalStep,
            resultImageUrl,
            selectedTemplate: selectedTemplate?.id,
            hasTemplate: !!selectedTemplate,
          });

          if (!resultImageUrl) {
            console.error('❌ Result modal: No resultImageUrl!');
            return (
              <div className="text-center py-8">
                <p className="text-red-500">Rasm URL topilmadi</p>
                <button
                  onClick={handleCloseModal}
                  className="mt-4 btn-primary px-6 py-2 rounded-lg"
                >
                  Yopish
                </button>
              </div>
            );
          }

          if (!selectedTemplate) {
            console.error('❌ Result modal: No selectedTemplate!');
            return (
              <div className="text-center py-8">
                <p className="text-red-500">Template topilmadi</p>
                <button
                  onClick={handleCloseModal}
                  className="mt-4 btn-primary px-6 py-2 rounded-lg"
                >
                  Yopish
                </button>
              </div>
            );
          }

          console.log('✅ Rendering ResultModal with:', {
            imageUrl: resultImageUrl,
            templateTitle: selectedTemplate.title,
          });

          return (
            <ResultModal
              imageUrl={resultImageUrl}
              templateTitle={selectedTemplate.title}
              onClose={handleCloseModal}
            />
          );
        })()}
      </Modal>

      {/* Alert */}
      <Alert
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertType}
        errorDetail={alertErrorDetail}
      />

      {/* Development Mode Indicator */}
      <DevModeIndicator />
    </>
  );
}
