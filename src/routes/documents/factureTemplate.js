const propertiesForFacture = (datas) => {
    return {
        returnJsPDFDocObject: true,
        // fileName: fileName,
        orientationLandscape: false,
        business: {
            name: datas.SCHOOL_NAME,
            address: datas.SCHOOL_ADRESS1 + " " + datas.SCHOOL_ZIPCODE + " " + datas.SCHOOL_CITY + " " + datas.SCHOOL_COUNTRY,
            phone: datas.SCHOOL_PHONE,
            email: datas.SCHOOL_EMAIL,
        },
        contact: {
            name: datas.USER_GENDER + " " + datas.USER_FIRSTNAME + " " + datas.USER_LASTNAME,
            address: datas.USER_ADRESS1 + " " + datas.USER_ZIPCODE + " " + datas.USER_CITY + " " + datas.USER_COUNTRY,
            phone: datas.USER_PHONE,
            email: datas.USER_MAIL,
            otherInfo: "N° Inscription : " + datas.USER_NUM_INSCR,
        },
        invoice: {
            label: "Invoice",
            headerBorder: false,
            tableBodyBorder: false,
            header: ["Ref.", "Designation", "Price", "Quantity", "Price HT", "TVA (%)", "Total TTC"],
            table: datas.ARTICLES,
            invTotalLabel: "Total:",
            invTotal: datas.TOTAL_TTC,
            invCurrency: "€",
            row1: {
                col1: 'Total TVA 20%',
                col2: datas.TOTAL_TVA,
                col3: '€',
                style: {
                    fontSize: 10 //optional, default 12
                }
            },
            row2: {
                col1: 'total HT',
                col2: datas.TOTAL_HT,
                col3: '€',
                style: {
                    fontSize: 10 //optional, default 12
                }
            },
            invDescLabel: "Informations de paiement",
            invDesc: "Vous pouvez nous payer par chèque en envoyant votre règlement à l’adresse suivante : \n" + datas.SCHOOL_NAME + "\n" + datas.SCHOOL_ADRESS1 + "\n" + datas.SCHOOL_ZIPCODE + " " + datas.SCHOOL_CITY + "\n" + datas.SCHOOL_COUNTRY,
        },
        footer: {
            text: datas.SCHOOL_NAME + "\n" + datas.SCHOOL_ADRESS1 + "\n" + datas.SCHOOL_ZIPCODE + " " + datas.SCHOOL_CITY + "\n" + datas.SCHOOL_COUNTRY + "\n" + "Phone :" + datas.SCHOOL_PHONE + " - " + "Email :" + datas.SCHOOL_EMAIL,
        },
        pageEnable: true,
        pageLabel: "Page ",
    };

}
module.exports = propertiesForFacture;