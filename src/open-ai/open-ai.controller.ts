import { Body, Controller, Get, HttpException, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('file')
export class OpenAiController {
    constructor(private readonly opeinAiService: OpenAiService){}


    //vérification du doc
    @Post("/check")
    @UseInterceptors(FileInterceptor("File"))
    async uploadFile(@UploadedFile() file: Express.Multer.File,@Res() res: Response, @Body("option") option: string){
        

        //vérifie si fichier existe
        if(!file){
            throw new HttpException({
                message: "Aucun fichier trouvé",
                success: false
            }, 404);
        }

        //verifie le type
        if(file.mimetype !== "application/pdf"){
            throw new HttpException({
                message: "Format du fichier refusé",
                success: false
            }, 200);
        }

        //vérifie la taille
        if(file.size > 5 * 1024 *1024){
            throw new HttpException({
                message: "Fichier trop grand",
                success: false
            }, 200);
        }
       try {
        const reponse = await this.opeinAiService.checkIfIsCours(file, option);

        console.log('voici ce que envoie pdfStream : ', reponse);
        return res.status(200).json(reponse)
        

        // res.setHeader('Content-Type', 'application/pdf');
        //     res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
        //     pdfStream.pipe(res).on('finish', () => {
        //         console.log('PDF envoyé avec succès');
        //       }).on('error', (err) => {
        //         console.error('Erreur lors de l\'envoi du PDF :', err);
        //       });
       } catch (error) {
        console.log("dasn le erreur du controllers");
        console.error('Erreur inattendue :', error);
        console.log("voici l'erreur **** ");
        console.log(error);
        if(error.status === 406){
         return  res.status(error.status).send(error.response)
        }else{
         return res.status(500).json({
            message: "Une erreur inattendue s'est produite",
            success: false
          });
        }
        
        
        // Gérer l'exception lancée par le service
  // if (error instanceof HttpException) {
  //   console.error('Erreur capturée :', error.message);
  //   res.status(error.getStatus()).json({
  //     message: error.getResponse()['message'],
  //     success: false
  //   });
  // } else {
  //   console.error('Erreur inattendue :', error);
  //   res.status(500).json({
  //     message: "Une erreur inattendue s'est produite",
  //     success: false
  //   });
  // }
       }
    }


    //création du doc
    @Post("/create")
    @UseInterceptors(FileInterceptor("File"))
    async createFile(@UploadedFile() file: Express.Multer.File,@Res() res: Response, @Body("cours") cours: string){
      //vérifie si fichier existe
      if(!file){
        throw new HttpException({
            message: "Aucun fichier trouvé",
            success: false
        }, 404);
    }

    //verifie le type
    if(file.mimetype !== "application/pdf"){
        throw new HttpException({
            message: "Format du fichier refusé",
            success: false
        }, 200);
    }

    //vérifie la taille
    if(file.size > 5 * 1024 *1024){
        throw new HttpException({
            message: "Fichier trop grand",
            success: false
        }, 200);
    }

    try {
      const pdfStream = await this.opeinAiService.createDocToClient(file, cours);

        console.log('voici ce que envoie pdfStream dans createFile : ', pdfStream);
        res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
            pdfStream.pipe(res).on('finish', () => {
                console.log('PDF envoyé avec succès');
              }).on('error', (err) => {
                console.error('Erreur lors de l\'envoi du PDF :', err);
              });
    } catch (error) {
      console.log("Erreur dans l'erreur de createFile controller");
      console.log(error);
      if (error instanceof HttpException) {
        console.error('Erreur capturée :', error.message);
        res.status(error.getStatus()).json({
          message: error.getResponse()['message'],
          success: false
        });
      } else {
        console.error('Erreur inattendue :', error);
        res.status(500).json({
          message: "Une erreur inattendue s'est produite",
          success: false
        });
      }
    }

    }

    @Get("/count")
    async getHowManyCreateDocControlller(@Res() res : Response){
      try {
        console.log("j'ai joué bou");
        
        const response = await this.opeinAiService.getCountCreateDoc();
        console.log(response);
        return res.status(200).json({
          count : response
        });
      } catch (error) {
        console.log("erreur dans le getHowManyCreateDocController");
        console.log(error);
        res.status(500).json({
          message: "Une erreur inattendue s'est produite",
          success: false
        });
      }
    }
}
