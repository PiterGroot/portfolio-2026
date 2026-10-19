@echo off
rem Double-click to create a new blog post from blog-template.html
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    py create_blog.py
) else (
    python create_blog.py
)

echo.
pause
