@echo off
echo Starting auto-commit and push...

git add .
git commit -m "Auto update"
git push origin main

echo.
echo Process complete! You can close this window now.
pause
