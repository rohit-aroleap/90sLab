@echo off
REM Local http server for the 90sLab dashboards.
REM Double-click this to let tablets (or any device on the same Wi-Fi)
REM load the dashboards over http, which unblocks the ws:// WebSocket
REM connection that https/GitHub Pages blocks on mobile browsers.
REM
REM After starting, open on the tablet:
REM    http://<this-laptop's-IP>:8000/forceplate.html
REM    http://<this-laptop's-IP>:8000/balance-board.html
REM
REM The laptop's IP is printed below. Find the IPv4 line for your Wi-Fi.

echo ==============================================
echo  90sLab local server
echo ==============================================
echo.
echo  Laptop IP addresses (use the Wi-Fi IPv4):
echo.
ipconfig | findstr /C:"IPv4"
echo.
echo  Open on tablet:
echo    http://^<laptop-ip^>:8000/forceplate.html
echo    http://^<laptop-ip^>:8000/balance-board.html
echo.
echo  Ctrl+C to stop.
echo ==============================================
echo.

cd /d "%~dp0"
python -m http.server 8000
