const instituts = [
    {
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
    },
    {
        label: "CALCU",
        email: "jodieyoung@calcu.com",
        phone: "+1 (907) 446-3240",
        adress1: "766 Kosciusko Street, Linganore, Maryland",
        adress2: "",
        zipcode: 4131,
        city: "Newkirk",
        country_id: 1,
        siteweb: "www.pushcart.com",
        socialNetwork: [
          "facebook",
          "twitter",
          "instagram",
          "linkedin"
        ]
      },
      {
        label: "ARTWORLDS",
        email: "jodieyoung@artworlds.com",
        phone: "+1 (881) 566-2139",
        adress1: "644 McKinley Avenue, Windsor, Mississippi",
        adress2: "",
        zipcode: 1182,
        city: "Smeltertown",
        country_id: 11,
        siteweb: "www.maxemia.com",
        socialNetwork: [
          "facebook",
          "twitter",
          "instagram",
          "linkedin"
        ]
      },
      {
        label: "DELPHIDE",
        email: "jodieyoung@delphide.com",
        phone: "+1 (936) 436-2765",
        adress1: "148 Grove Street, Enoree, North Dakota",
        adress2: "",
        zipcode: 6325,
        city: "Norvelt",
        country_id: 88,
        siteweb: "www.isostream.com",
        socialNetwork: [
          "facebook",
          "twitter",
          "instagram",
          "linkedin"
        ]
      },
      {
        label: "XYLAR",
        email: "jodieyoung@xylar.com",
        phone: "+1 (866) 443-3724",
        adress1: "210 Kaufman Place, Idamay, New Jersey",
        adress2: "",
        zipcode: 4756,
        city: "Belfair",
        country_id: 227,
        siteweb: "www.zaggle.com",
        socialNetwork: [
          "facebook",
          "twitter",
          "instagram",
          "linkedin"
        ]
      },
      {
        label: "MANTRO",
        email: "jodieyoung@mantro.com",
        phone: "+1 (922) 412-3806",
        adress1: "564 Clay Street, Tivoli, Idaho",
        adress2: "",
        zipcode: 1287,
        city: "Tecolotito",
        country_id: 12,
        siteweb: "www.digigene.com",
        socialNetwork: [
          "facebook",
          "twitter",
          "instagram",
          "linkedin"
        ]
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