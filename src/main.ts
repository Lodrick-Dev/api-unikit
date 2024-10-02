import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //on ajoute cette ligne pour afiché les erreur de de validationPip
  //ici on l'active Globalement
  //si pour chaque endPoint alors 
  //voir dans les fichier controllers
  // app.useGlobalPipes(new ValidationPipe())

  //cors
  app.enableCors({
    origin: process.env.URL_SIMPLE, // Remplacez par l'URL de votre frontend ou '*' pour autoriser toutes les origines
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Méthodes HTTP autorisées
    allowedHeaders: 'Content-Type, Authorization', // En-têtes autorisés
    credentials: true, // Si vous avez besoin de gérer les cookies, les en-têtes d'autorisation, etc.
  })

  await app.listen(5007);
  console.log("server listen on port 5007");
  
}
bootstrap();
