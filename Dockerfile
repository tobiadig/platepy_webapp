# syntax=docker/dockerfile:1
FROM python:3.8-slim-buster

ENV PYTHONUNBUFFERED True

ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./


RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update

RUN apt-get install libz1 libgl1 libxrender1 libxcursor1 libxfixes3 libxext6 libxft2 libfontconfig1 libxinerama1 libxshmfence1 libxcb-present0 libexpat1 libc6 libstdc++6 libxcb-glx0 libxcb-sync1 libglu1 libdrm2 libxdamage1 libx11-xcb1 libxxf86vm1 libxcb1 libfreetype6 libxau6 libxdmcp6 -y 


CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app

# CMD [ "python", "-m" , "flask", "run"]