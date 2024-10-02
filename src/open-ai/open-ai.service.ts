import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createWriteStream } from 'fs';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { CountCreateDoc } from 'src/Schemas/countCreateDoc.schemas';
const pdf = require("pdf-parse");
// import PDFDocument from 'pdfkit';
const PDFDocument = require('pdfkit');

import { PassThrough } from 'stream';

@Injectable()
export class OpenAiService {
    //private : pour dire la méthode est eccéssible
    //seulement dans cette classe
    //readonly : pour dire que la méthode ne peut
    //etre modifier mais seulement lu
    private openai: OpenAI;
    constructor(@InjectModel(CountCreateDoc.name) private countCreateDocModel: Model<CountCreateDoc>){
        this.openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    }

    async checkIfIsCours (file: Express.Multer.File, option: string){

      let msgToFront;
      let codeStatus = 404;
        try {
            const dataFile = await pdf(file.buffer)
            const details = dataFile.text;

            let checkCours: { msg: string } = { msg: "" };
            checkCours.msg = await this.coursOrNot(details);
            // console.log(JSON.parse(checkCours.msg));
            const response = JSON.parse(checkCours.msg)
            if(response.msg === "oui"){
              const coursAndSujet = await this.coursAndSujet(details);
              // const stream = await this.createDocPdf(result);
              // return stream;
              return coursAndSujet;

              // const passThrough = new PassThrough();
              // return passThrough;
            }else{
              msgToFront = "Les données reçues ne ressemblent pas à un cours"
              codeStatus = 406;
              throw new HttpException({
                message: "Les données reçues ne ressemblent pas à un cours",
                success: false
            }, codeStatus);
            }
        } catch (error) {
          console.log(error);
          
            console.log("Error dans l'extraction du fichier");
            throw new HttpException({
                message: `Erreur : ${msgToFront}`,
                success: false
            }, codeStatus);
            
        }
    }


    private choseOption = (option)=>{
      let exemple;
      let consigne;
      switch (option) {
        case "histoire":
          exemple = {
            "titre": "Titre du chapitre ou du concept",
            "définitions": [],
            "formules_clés": [],
            "théorèmes": [],
            "propriétés": [],
            "méthodes": [],
            "exemples": [],
            "exercices": [],
            "résumé_des_points_clés": []
          };
          consigne = `Vous êtes un assistant pédagogique spécialisé dans la matière suivante : ${option}. Votre réponse est en français. Votre objectif est de créer une fiche de révision concise et bien structurée à partir du contenu du cours fourni. La fiche de révision doit respecter la structure JSON suivante : ${exemple}. Si une section ne s'applique pas, laissez-la vide mais incluez-la quand même dans la structure finale.`
          return consigne;

          case "science":
            consigne = `Vous êtes un assistant pédagogique spécialisé dans la matière suivante : Science. 
Votre tâche est de créer une fiche de révision chargée, concise, avec les informations qu'il faut et bien structurée à partir du contenu du cours fourni. 
La fiche doit inclure les sections suivantes : 
1. "Titre du cours : " - Titre
2. "Définitions clés : " - pour les concepts et termes scientifiques importants,
3. "Lois et principes : " - pour les lois et théories scientifiques majeures,
4. "Formules clés : " - pour les formules scientifiques importantes,
5. "Processus scientifiques : " - pour les explications des mécanismes ou phénomènes scientifiques,
6. "Expériences : " - pour des exemples d'expériences pratiques ou historiques,
7. "Applications pratiques : " - pour les exemples de mise en pratique des théories ou concepts scientifiques,
8. "Exemples : " - pour illustrer les concepts ou lois avec des cas pratiques,
9. "Résumé des points clés : " - pour résumer les notions à retenir.

Répondez uniquement en texte, sans formatage JSON. Si une section ne s'applique pas, laissez-la vide.`
            return consigne;
        default:
          break;
      }
    }


    //check if is  a cours/errorExist
    private coursOrNot = async (data)=>{
      const error= {msg : "non"}
      const cours= {msg : "oui"}
      try {
        const  completion = await this.openai.chat.completions.create({
          messages:[
              {role: "system", content: `Vous êtes un assistant pédagogique dont la tâche est de vérifier si les données reçues ressemblent à un cours. 
Pour qu'un texte soit considéré comme un cours, il doit contenir des éléments comme :
- Un titre de cours ou de leçon.
- Des définitions de concepts clés liés à une matière spécifique.
- Des explications détaillées, des exemples, des formules, ou des démonstrations.
- Une structure claire incluant des sections comme introduction, développement, et conclusion.

Si le texte ressemble à un CV, contient des informations personnelles, des expériences professionnelles, des compétences, ou tout autre contenu lié à une biographie ou à un parcours de carrière, alors ce n'est pas un cours.
Si le texte contient des éléments tels que :
- Des **informations personnelles** (nom, adresse, e-mail, numéro de téléphone).
- Une **liste d'expériences professionnelles** ou de stages.
- Des **compétences** ou **qualifications**.
- Une **liste de diplômes ou de formations** suivies.
- Des **références** professionnelles ou personnelles.

Alors, ce texte **n'est pas** un cours mais plutôt un CV ou un document professionnel.

Veuillez analyser attentivement le texte et répondre en stricte conformité avec ces critères.
          
          Votre réponse doit être strictement au format JSON :
          Si le texte correspond à un cours, répondez strictement par : ${JSON.stringify(cours)}
          Si le texte ne correspond pas à un cours, répondez strictement par : ${JSON.stringify(error)}

          N'ajoutez aucune information supplémentaire, aucun titre, aucun résumé ou autres détails. Votre réponse doit être exactement l'un des deux formats de réponse JSON.
          
          Exemple de données qui ne sont pas un cours : CV, lettres de motivation, articles de blog, résumés de carrière, etc.

Analysez attentivement les données fournies et répondez en conséquence.
          `},{
                  role: "user",
                  content: data,
              }
          ],
          // model: "gpt-4o",
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
      })
  
       const result = completion.choices[0].message.content;
      //  console.log(JSON.stringify(result, null, 2));
       
       return result
        
      } catch (error) {
        console.log("error dans le vérification si c'est cours ou pas");
        throw new HttpException({
          message: "Erreur dans la vérification si c'est un cours",
          success: false
      }, 404);
      }
    }

    //while doc , name cours et sujet about cours
    private coursAndSujet = async (data)=>{
      const exemple = [
        {cours: "<le cours>"},
        {sujet: "<le sujet du cours>"},
      ]
      try {
        const  completion = await this.openai.chat.completions.create({
          messages:[
              {role: "system", content: `Identifie le cours et le sujet à partir des informations fournies par l'utilisateur. Donne le nom du cours et le sujet dans ta réponse. Je veux une réponse très courte et précise. Voici un exemple de format attendu ${JSON.stringify(exemple)}. Merci de fournir ta réponse au format JSON de cette manière, avec uniquement 2 index "cours" et "sujet" par objet JSON.`},{
                  role: "user",
                  content: data,
              }
          ],
          // model: "gpt-4o",
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
      })
  
       const result = completion.choices[0].message.content;
    //    throw new HttpException({
    //     message: `ici le return : ${result}`,
    //     success: false
    // }, 200);
       
    const parsedResult = JSON.parse(result);

    return parsedResult; // Retourner l'objet JSON
        
      } catch (error) {
        
        console.log("error dans le vérification si c'est cours ou pas dans coursAndSujet");
        console.log(error);
        throw new HttpException({
          message: "Erreur dans la vérification si c'est un cours",
          success: false
      }, 404);
      }
    }


    async createDocToClient(file: Express.Multer.File, cours: string):Promise<PassThrough>{
      try {
        const dataFile = await pdf(file.buffer)
            const details = dataFile.text;
        let checkCours: { msg: string } = { msg: "" };
      checkCours.msg = await this.coursOrNot(details);
      console.log(JSON.parse(checkCours.msg));
      const response = JSON.parse(checkCours.msg)
      if(response.msg === "oui"){
        const toDataToCreateDoc =  await this.dataToCreateDoc(details, cours)
        const stream = await this.createDocPdf(toDataToCreateDoc);
        this.countToKnowHowMuchCreateDoc();
        return stream;
        
      }
      } catch (error) {
        console.log("Erreur dans createDocToClient dans le service :");
        console.log(error);
        throw new HttpException({
          message: "Erreur lors de la création final du doc",
          success: false
      }, 404);
      }
    }

    //création du doc
    private createDocPdf = async (data)=>{
      // Étape 2 : Génération du PDF avec PDFKit
      const doc = new PDFDocument();
      const stream = new PassThrough();

      doc.pipe(stream);

      // Ajouter un en-tête avec la date actuelle
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const currentDate = `${day}/${month}/${year}`;

      doc.fontSize(12).text(`www.lodrick-web.fr  - le ${currentDate}`, { align: 'right' });
      doc.fontSize(12).text(`Rédigé par l'IA qui fait de son mieux`, { align: 'center' });
      doc.moveDown(1); // Ajouter un espace après l'en-tête

      // Étape 3 : Ajouter le contenu généré par l'IA
      doc.fontSize(18).text('Fiche de révision', { align: 'center' });
      doc.moveDown(1);

    // Séparer la réponse en sections
      const sections = data.split('\n\n'); // Sépare les paragraphes ou sections de la réponse de l'IA
      sections.forEach((section, index) => {
        if (section.trim()) {
            // doc.fontSize(14).text(`Section ${index + 1}`, { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).text(section.trim());
            doc.moveDown(1);
        }
    });

      // Terminer le document PDF
      doc.end();

      // On renvoie le flux de données du PDF
      return stream;
    }

    //data to create Doc - 
    private dataToCreateDoc = async (data, cours )=>{
      const consigne = `Tu es un assistant qui va aider à créer une fiche de révision claire et bien structurée et bien fourni pour la révision. 
                    Ta tâche est de créer une fiche de révision à partir des données fournies. La fiche de révision doit être basée sur le cours intitulé "${cours}". Mais surtout des données envoyé par l'utilisateur.
                    Organise la fiche de révision de manière à ce qu'elle soit facile à lire et à comprendre, en utilisant des titres, sous-titres, des points importants, des définitions clés, des exemples, et des résumés lorsque c'est pertinent. 
                    Assure-toi que la fiche est bien structurée, informative, et utile pour une révision efficace.`;

      const consignee = `Tu es un assistant qui va aider à créer une fiche de révision claire et bien structurée et bien fourni pour la révision. 
                    Ta tâche est de créer une fiche de révision à partir des données fournies. Alors analyse les données reçus, le sujet ou les sujets, la matière du cours reçu. Et en fonction de toutes ses données rédige la fiche de révision ADAPTER au sujet et à la matière grâce aux données reçus`
            try {
        const  completion = await this.openai.chat.completions.create({
          messages:[
              {role: "system", content: consignee},{
                  role: "user",
                  content: data,
              }
          ],
          // model: "gpt-4o",
          model: "gpt-4o-mini",
      })

      const result = completion.choices[0].message.content;
      return result
       
      } catch (error) {
        console.log('Erreur dans dataToCreateDoc :');
        console.log(error);
        throw new HttpException({
          message: "Erreur lors de la génération des données pour la création du doc",
          success: false
      }, 404);
      }
    }

    //count create Doc
    private countToKnowHowMuchCreateDoc = async ()=>{
      const nameDoc ="countDocCreate"

      const docExist = await this.countCreateDocModel.findOne({nameRequet: nameDoc});
      if(docExist){
        docExist.nombRequet += 1;
        await docExist.save();
      }else{
        const newSave = new this.countCreateDocModel({nameRequet: "countDocCreate", nombRequet: 1})
        await newSave.save()
      }
    }

    //to get how many create doc
    async getCountCreateDoc (){
      const count = await this.countCreateDocModel.findOne({nameRequet: "countDocCreate"});
      return count ? count.nombRequet : 0;
    }
}
