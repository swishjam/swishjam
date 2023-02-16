FROM public.ecr.aws/lambda/nodejs:14

COPY package*.json ./

RUN npm install

COPY . .

CMD ["app.lambdaHandler"]