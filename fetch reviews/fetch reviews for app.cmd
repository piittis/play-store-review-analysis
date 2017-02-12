@echo off
set /p appId=app id: 
node fetchReviews %appId%
pause