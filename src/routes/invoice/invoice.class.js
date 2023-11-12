const {models} = require('../../models');
const { format } = require('date-fns');

function generateInvoiceID(sessionID, userID, instituteID) {

}

function generateInvoice(sessionID, userID, instituteID) {

        // Récupération des informations de


}

class Invoice {

    constructor(institut_id=null, session_id=null, user=null) {
        this.institut_id = institut_id ? +institut_id : null;
        this.session_id = session_id? +session_id : null;
        this.user = user;
        this.session = null;
        this.level = null;
    }

    async initialize() { 
        // Etape 1 : On charge les paramétres de la session
        await this.#setSession();
    }

    async generate() {

        // création de la facture
        const createDate = new Date();
        const dueDate = createDate.setDate(createDate.getDate() + 45)
        
        const userRef = padWithZeros(+newUser.user_id)
        const invoiceHeader = {
            institut_id: this.institut_id,
            session_id: this.session_id,
            user_id: +newUser.user_id,
            session: `Session du ${format(Session.start, 'dd/MM/yyyy')} au ${format(Session.end, 'dd/MM/yyyy')}`,
            customerFirstname: newUser.firstname,
            customerLastname: newUser.lastname,
            customerAddress1: newUser.adress1,
            customerAddress2: newUser.adress2,
            customerCity: newUser.city,
            customerZipCode: newUser.zipcode,
            customerCountry: newUser.country.label,
            customerEmail: newUser.email,
            customerPhone: newUser.phone,
            status: newSessionUser.hasPaid,
            ref_client: `REF-${userRef}`,
            ref_invoice: generateInvoiceID(+req.params.session_id,+newUser.user_id,+req.params.institut_id),
            test: Test.label,
            level: Level ? Level.label : null,
            createDate: new Date(),
            dueDate, 
        }
    }


    async #setSession() {
        const Session = await models['Session'].findOne({
            where: {
                institut_id: this.institut_id,
                session_id: this.session_id,
            },
            include: [{
                model: models['Test'],
                attributes: ["label"]
            },
            {
                model: models['Level'],
                attributes: ["label"]
            }]
            
        });
        this.session = Session;
    }

    #generateInvoiceID() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Mois avec 2 chiffres
        const day = currentDate.getDate().toString().padStart(2, '0'); // Jour avec 2 chiffres
        const hours = currentDate.getHours().toString().padStart(2, '0'); // Heure avec 2 chiffres
        const minutes = currentDate.getMinutes().toString().padStart(2, '0'); // Minutes avec 2 chiffres
        const seconds = currentDate.getSeconds().toString().padStart(2, '0'); // Secondes avec 2 chiffres
      
        const invoiceID = `${year}${month}${day}${hours}${minutes}${this.user.user_id}`;
        return invoiceID;
      }
    
    #padWithZeros(number) {
        const numberString = number.toString();
        const zerosToAdd = 8 - numberString.length;
        
        if (zerosToAdd <= 0) {
          // Si le nombre est déjà de 5 caractères ou plus, retourne tel quel.
          return numberString;
        } else {
          // Ajoute des zéros au début du nombre.
          const paddedNumber = '0'.repeat(zerosToAdd) + numberString;
          return paddedNumber;
        }
      }

}

module.exports = {
    Invoice
};