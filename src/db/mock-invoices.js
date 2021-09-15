const invoices = [
    {
        "institut_id": 2,
        "isPaid": false,
        "reference": '2021/08',
        "ref_client": "Session du 01/01/1999",
        "test": "DELF NATURALISATION",
        "price_total_TTC": 75,
        "lines": [
            {
                "invoice_id": 1,
                "num_line": 1,
                "label": "Epreuve 1",
                "quantity": 5,
                "price_pu_ttc": 10,
                "tva": 20.00
            },
            {
                "invoice_id": 1,
                "num_line": 2,
                "label": "Epreuve 1",
                "quantity": 2,
                "price_pu_ttc": 10,
                "tva": 10.00
            }
        ]
    }
]

module.exports = invoices;