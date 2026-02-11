@echo off
echo Cleaning Next.js build artifacts...

if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
)

if exist node_modules\.cache (
    echo Removing node_modules cache...
    rmdir /s /q node_modules\.cache
)

echo Clean complete!
echo Run 'npm run build' to rebuild the application.
