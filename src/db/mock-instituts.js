const instituts = [
    {
        institut_id: 1,
        label: "Institut Français",
        adress1: "123 rue du Général Degaule",
        adress2: "",
        zipcode: "75000",
        city: "paris",
        country_id: 76,
        email: "contact@institut-france.com",
        siteweb: 'www.institut-france.fr',
        phone: '+33123456789',
        socialNetwork: ["facebook","twitter","instagram","linkedin"]
    },
    {
        institut_id: 2,
        label: "Tenri Japanese School",
        adress1: "456bis Avenue Jules Brunet",
        adress2: "Apt 15B - Bât 12",
        zipcode: "75000",
        city: "paris",
        country_id: 76,
        email: "contact@tenri.co.jp",
        siteweb: 'www.tenri.co.jp',
        phone: '+9874561230',
        socialNetwork: ["facebook","twitter","instagram","linkedin"]
    }
];
module.exports = instituts;

/* JSON GENERATOR
[
  '{{repeat(5)}}',
  {
    label: '{{company().toUpperCase()}}',
    email: '{{email()}}',
    phone: '+1 {{phone()}}',
    adress1:'{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}',
    adress2:'',
    zipcode:'{{integer(100, 10000)}}',
    city:'{{city()}}',
    country_id:'{{integer(1, 249)}}',
    siteweb:'www.{{company().toLowerCase()}}.com',
    socialNetwork:["facebook","twitter","instagram","linkedin"]
  }
]
*/