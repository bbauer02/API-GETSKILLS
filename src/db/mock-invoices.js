const invoices = [
    {
        "institut_id": 2,
        "isPaid": false,
        "ref_client": "Session du 01/01/1999",
        "test": "DELF NATURALISATION",
        "price_total_TTC": 70,
        "lines": [
            {
                "label": "Epreuve 1",
                "quantity": 5,
                "price_pu_ttc": 10,
                "tva": 20.00
            },
            {
                "label": "Epreuve 1",
                "quantity": 2,
                "price_pu_ttc": 10,
                "tva": 10.00
            }
        ]
    }
]

module.exports = invoices;