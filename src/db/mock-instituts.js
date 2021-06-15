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
    label: "Pyrami",
    adress1: "121 Roosevelt Place, Alderpoint, Guam",
    adress2: "",
    email: "minervamorris@pyrami.com",
    siteweb: "www.interloo.com",
    phone: "+1 (890) 447-3426",
    zipcode: 3055,
    city: "Toftrees",
    country_id: 174,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Snips",
    adress1: "496 Judge Street, Ernstville, Massachusetts",
    adress2: "",
    email: "minervamorris@snips.com",
    siteweb: "www.amtap.com",
    phone: "+1 (960) 538-3705",
    zipcode: 7904,
    city: "Chautauqua",
    country_id: 175,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Neptide",
    adress1: "672 Williams Court, Bridgetown, Iowa",
    adress2: "",
    email: "minervamorris@neptide.com",
    siteweb: "www.squish.com",
    phone: "+1 (899) 589-2866",
    zipcode: 6739,
    city: "Tuskahoma",
    country_id: 55,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Zensure",
    adress1: "142 Foster Avenue, Grantville, Puerto Rico",
    adress2: "",
    email: "minervamorris@zensure.com",
    siteweb: "www.namebox.com",
    phone: "+1 (870) 428-2239",
    zipcode: 3558,
    city: "Vandiver",
    country_id: 236,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Hydrocom",
    adress1: "685 College Place, Warsaw, District Of Columbia",
    adress2: "",
    email: "minervamorris@hydrocom.com",
    siteweb: "www.knowlysis.com",
    phone: "+1 (996) 512-2638",
    zipcode: 2119,
    city: "Ruckersville",
    country_id: 96,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Genmom",
    adress1: "987 Wyckoff Street, Trona, Missouri",
    adress2: "",
    email: "minervamorris@genmom.com",
    siteweb: "www.colaire.com",
    phone: "+1 (993) 507-2654",
    zipcode: 4744,
    city: "Grandview",
    country_id: 17,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Uni",
    adress1: "991 Crawford Avenue, Zortman, Nebraska",
    adress2: "",
    email: "minervamorris@uni.com",
    siteweb: "www.zipak.com",
    phone: "+1 (905) 504-2310",
    zipcode: 7776,
    city: "Disautel",
    country_id: 103,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Jumpstack",
    adress1: "388 Sandford Street, Wakarusa, Illinois",
    adress2: "",
    email: "minervamorris@jumpstack.com",
    siteweb: "www.naxdis.com",
    phone: "+1 (938) 427-2521",
    zipcode: 1692,
    city: "Roland",
    country_id: 140,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Farmage",
    adress1: "512 Dooley Street, Ticonderoga, Tennessee",
    adress2: "",
    email: "minervamorris@farmage.com",
    siteweb: "www.klugger.com",
    phone: "+1 (820) 529-2237",
    zipcode: 6046,
    city: "Harborton",
    country_id: 17,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Silodyne",
    adress1: "441 Louis Place, Beason, Michigan",
    adress2: "",
    email: "minervamorris@silodyne.com",
    siteweb: "www.insuresys.com",
    phone: "+1 (822) 585-2772",
    zipcode: 4592,
    city: "Elliston",
    country_id: 194,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Bulljuice",
    adress1: "557 Dank Court, Whitmer, Wisconsin",
    adress2: "",
    email: "minervamorris@bulljuice.com",
    siteweb: "www.assurity.com",
    phone: "+1 (834) 443-3755",
    zipcode: 2921,
    city: "Oasis",
    country_id: 13,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Emoltra",
    adress1: "234 Quincy Street, Frank, Louisiana",
    adress2: "",
    email: "minervamorris@emoltra.com",
    siteweb: "www.motovate.com",
    phone: "+1 (995) 420-2774",
    zipcode: 5206,
    city: "Juntura",
    country_id: 24,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Dragbot",
    adress1: "236 Henry Street, Abrams, Oklahoma",
    adress2: "",
    email: "minervamorris@dragbot.com",
    siteweb: "www.premiant.com",
    phone: "+1 (800) 550-2277",
    zipcode: 8469,
    city: "Condon",
    country_id: 37,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Ovolo",
    adress1: "672 Irving Street, Gasquet, New York",
    adress2: "",
    email: "minervamorris@ovolo.com",
    siteweb: "www.caxt.com",
    phone: "+1 (901) 577-2467",
    zipcode: 8740,
    city: "Hiko",
    country_id: 89,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Genesynk",
    adress1: "460 Whitney Avenue, Rose, Alabama",
    adress2: "",
    email: "minervamorris@genesynk.com",
    siteweb: "www.quinex.com",
    phone: "+1 (887) 435-2990",
    zipcode: 6069,
    city: "Herlong",
    country_id: 194,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Quonata",
    adress1: "899 Clarkson Avenue, Gerber, American Samoa",
    adress2: "",
    email: "minervamorris@quonata.com",
    siteweb: "www.medicroix.com",
    phone: "+1 (890) 534-2324",
    zipcode: 549,
    city: "Stouchsburg",
    country_id: 149,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Boilcat",
    adress1: "421 Sapphire Street, Retsof, Idaho",
    adress2: "",
    email: "minervamorris@boilcat.com",
    siteweb: "www.kneedles.com",
    phone: "+1 (813) 449-2640",
    zipcode: 9681,
    city: "Brooktrails",
    country_id: 206,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Playce",
    adress1: "392 Garfield Place, Layhill, Virgin Islands",
    adress2: "",
    email: "minervamorris@playce.com",
    siteweb: "www.opticom.com",
    phone: "+1 (906) 559-2662",
    zipcode: 5393,
    city: "Dante",
    country_id: 115,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Dancerity",
    adress1: "603 Etna Street, Wauhillau, South Carolina",
    adress2: "",
    email: "minervamorris@dancerity.com",
    siteweb: "www.junipoor.com",
    phone: "+1 (816) 416-2999",
    zipcode: 4399,
    city: "Boykin",
    country_id: 101,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Aquacine",
    adress1: "516 Hanson Place, Rivers, New Mexico",
    adress2: "",
    email: "minervamorris@aquacine.com",
    siteweb: "www.zilla.com",
    phone: "+1 (941) 471-3449",
    zipcode: 3594,
    city: "Clara",
    country_id: 49,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Geeky",
    adress1: "364 Portland Avenue, Caberfae, Northern Mariana Islands",
    adress2: "",
    email: "minervamorris@geeky.com",
    siteweb: "www.mixers.com",
    phone: "+1 (888) 524-3197",
    zipcode: 395,
    city: "Villarreal",
    country_id: 124,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Xth",
    adress1: "436 Ridge Boulevard, Sheatown, Maryland",
    adress2: "",
    email: "minervamorris@xth.com",
    siteweb: "www.vantage.com",
    phone: "+1 (858) 454-3147",
    zipcode: 8631,
    city: "Hayden",
    country_id: 107,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Comstar",
    adress1: "148 Nostrand Avenue, Ryderwood, Mississippi",
    adress2: "",
    email: "minervamorris@comstar.com",
    siteweb: "www.otherway.com",
    phone: "+1 (858) 521-3513",
    zipcode: 255,
    city: "Hollymead",
    country_id: 249,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Assitia",
    adress1: "133 Kensington Walk, Hanover, South Dakota",
    adress2: "",
    email: "minervamorris@assitia.com",
    siteweb: "www.ziggles.com",
    phone: "+1 (977) 552-2550",
    zipcode: 5999,
    city: "Biddle",
    country_id: 237,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Quantasis",
    adress1: "412 Berry Street, Finderne, Pennsylvania",
    adress2: "",
    email: "minervamorris@quantasis.com",
    siteweb: "www.xyqag.com",
    phone: "+1 (979) 445-2805",
    zipcode: 3772,
    city: "Lowgap",
    country_id: 57,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Deepends",
    adress1: "406 Dwight Street, Summertown, Oregon",
    adress2: "",
    email: "minervamorris@deepends.com",
    siteweb: "www.martgo.com",
    phone: "+1 (906) 493-2814",
    zipcode: 6389,
    city: "Kaka",
    country_id: 189,
    socialNetwork: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin"
    ]
  },
  {
    label: "Suretech",
    adress1: "303 Court Square, Wheaton, Arkansas",
    adress2: "",
    email: "minervamorris@suretech.com",
    siteweb: "www.immunics.com",
    phone: "+1 (970) 505-3599",
    zipcode: 2820,
    city: "Dixonville",
    country_id: 25,
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