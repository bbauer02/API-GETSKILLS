const {models} = require('../../models');
const { format } = require('date-fns');

class Invoice {

    constructor(institut_id=null, session_id=null, user=null, sessionUser=null) {
        this.institut_id = institut_id ? +institut_id : null;
        this.session_id = session_id? +session_id : null;
        this.user = user;
        this.session = null;
        this.sessionUser = sessionUser;
    }

    async generateInvoice() { 
        // Etape 1 : On charge les paramétres de la session
        await this.#setSession();
        await this.#generateHeader();
        await this.#generateLines();
    }

    async #generateHeader() {
        // création de la facture
        const createDate = new Date();
        const dueDate = createDate.setDate(createDate.getDate() + 45) 
        const userRef = this.#padWithZeros(+this.user.user_id);
        const invoiceHeader = {
            institut_id: +this.institut_id,
            session_id: +this.session_id,
            user_id: +this.user.user_id,
            session: `Session du ${format(this.session.start, 'dd/MM/yyyy')} au ${format(this.session.end, 'dd/MM/yyyy')}`,
            customerFirstname: this.user.firstname,
            customerLastname: this.user.lastname,
            customerAddress1: this.user.adress1,
            customerAddress2: this.user.adress2,
            customerCity: this.user.city,
            customerZipCode: this.user.zipcode,
            customerCountry: this.user.country.label,
            customerEmail: this.user.email,
            customerPhone: this.user.phone,
           // status: newSessionUser.hasPaid,
            ref_client: `REF-${userRef}`,
            ref_invoice: this.#generateInvoiceID(+this.session_id,+this.user.user_id,+this.institut_id),
            test: this.session.Test.label,
            level: this.session.Level ? this.session.Level.label : null,
            createDate: new Date(),
            dueDate, 
        }
         this.invoiceHeader = await models['Invoice'].create(invoiceHeader);
    }

    async #generateLines() {

        // On va chercher les UsersOptions
        const sessionUserOptions = await models['sessionUserOption'].findAll({
            where: {sessionUser_id: +this.sessionUser.sessionUser_id },
            include: [
                {
                    model: models['Exam'],
                }
            ]

        });

        // On doit maintenant ajouter la liste des épreuves obligatoires + les options
        const SessionHasExams = await models['sessionHasExam'].findAll(
            {
                where: {session_id: +this.session_id},
                include: [
                    {
                        model: models['Exam'],
                        include: [{
                            model: models['InstitutHasPrices'],
                            required: false,
                            attributes: ['price', 'tva'],
                            where: {
                                institut_id: +this.institut_id, 
                            }
                        }]
                    }
                ]
            }
        );
        // On ne récupére que les options obligatoires
        const optionsObligatoires  = SessionHasExams.filter(_sessionHasExam => {
            // On vérifie si isOption est false
            const isOptionCondition = _sessionHasExam.Exam.isOption === false;
            // Vérifie si exam_id n'est pas présent dans le tableau des options sessionUserOptions
            const isNowUserOption = !sessionUserOptions.some(_userOption => _userOption.exam_id === _sessionHasExam.Exam.exam_id);
            // Retourne true uniquement si les deux conditions sont satisfaites
            return isOptionCondition && isNowUserOption;
        
        });
        // On va creer des lignes dans la facture contenant dans un premier temps
        const invoiceLines = [];
        optionsObligatoires.forEach(_option => {
            invoiceLines.push({
                invoice_id: +this.invoiceHeader.invoice_id,
                label: _option.Exam.label,
                price_HT: _option.Exam.InstitutHasPrices.length > 0 ? _option.Exam.InstitutHasPrices[0].price : _option.Exam.price,
                tva: _option.Exam.InstitutHasPrices.length > 0 ? _option.Exam.InstitutHasPrices[0].tva : 22,
                exam_id: _option.Exam.exam_id
            }) 
        });
        // On ajoute les option
        sessionUserOptions.forEach(_option => {
            invoiceLines.push({
                invoice_id: +this.invoiceHeader.invoice_id,
                label: _option.Exam.label,
                price_HT: _option.user_price,
                tva: _option.tva,
                exam_id: _option.exam_id

            })
        });
        await models['InvoiceLines'].bulkCreate(invoiceLines);
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