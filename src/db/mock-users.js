const users = [
    {
        login: "bauer",
        password: "bb1212",
        email: "bbauer02@gmail.com",
        phone: '+330323522248',
        gender: 1,
        civility: 1,
        firstname: "Baptiste",
        lastname: "Bauer",
        adress1: "30 rue Robert Leroux",
        adress2: "",
        zipcode: "02000",
        city: "laon",
        country_id: 76,
        birthday: new Date(1982, 7, 4),
        nationality_id: 76,
        firstlanguage_id: 76,
        systemRole_id: 5
    },
    {
        login: "umebosi1014",
        password: "ume1014",
        email: "umebosi1014@yahoo.co.jp",
        phone: '0706050403',
        gender: 2,
        civility: 2,
        firstname: "Ayaka",
        lastname: "Oyama",
        adress1: "3 rue Georges Citerne",
        adress2: "Apt 1",
        zipcode: "75015",
        city: "paris",
        country_id: 76,
        birthday: new Date(1988, 9, 14),
        nationality_id: 112,
        firstlanguage_id: 46,
        systemRole_id: 1
    },
    {
        login: "cLefebre",
        password: "lfvr1234*",
        email: "cLefebre@gmail.com",
        phone: '123456789',
        gender: 1,
        civility: 1,
        firstname: "Christophe",
        lastname: "Lefebre",
        adress1: "5 boulevard Voltaire",
        adress2: "Apt 6",
        zipcode: "13000",
        city: "marseille",
        country_id: 76,
        birthday: new Date(1987, 10, 14),
        nationality_id: 76,
        firstlanguage_id: 76
    }
];
module.exports = users;
/* JSON GENERATOR
[
    '{{repeat(100)}}',
    {
      role_id: '{{integer(1, 5)}}',
      login: '{{surname().toUpperCase()}}',
      password:'{{surname()}}{{integer(0, 9)}}{{integer(0, 9)}}{{integer(0, 9)}}',
      email: '{{email()}}',
      phone: '+1 {{phone()}}',
      civility:'{{integer(1, 3)}}',
      gender : '{{integer(1, 2)}}',
      firstname: '{{firstName()}}',
      lastname: '{{surname()}}',
      adress1:'{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}',
      adress2:'',
      zipcode:'{{integer(100, 10000)}}',
      city:'{{city()}}',
      country_id:'{{integer(1, 249)}}',
      birthday:'{{date(new Date(1940, 0, 1),new Date(2001, 0, 1), "YYYY-MM-dd")}}',
      nationality_id:'{{integer(1, 249)}}',
      firstlanguage_id:'{{integer(1, 249)}}'
      
    }
  ]*/