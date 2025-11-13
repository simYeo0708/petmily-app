export const speciesOptions = [
    { key: "dog", label: "강아지", iconName: "dog" as const },
    { key: "cat", label: "고양이", iconName: "cat" as const },
    { key: "other", label: "기타", iconName: "paw" as const },
  ];

export const breedOptions = {
    dog: [
      "Abyssinian", "American Bulldog", "American Pit Bull Terrier", "Basset Hound", "Beagle",
      "Bengal", "Border Collie", "Boxer", "British Shorthair", "Bulldog", "Chihuahua",
      "Cocker Spaniel", "Collie", "Dalmatian", "Doberman Pinscher", "English Setter",
      "German Shepherd", "Golden Retriever", "Great Dane", "Havanese", "Jack Russell Terrier",
      "Keeshond", "Labrador Retriever", "Maine Coon", "Maltese", "Munchkin", "Newfoundland",
      "Persian", "Pomeranian", "Poodle", "Pug", "Ragdoll", "Rottweiler", "Russian Blue",
      "Saint Bernard", "Samoyed", "Scottish Fold", "Shiba Inu", "Siberian Husky", "Siamese",
      "Staffordshire Bull Terrier", "Weimaraner", "Yorkshire Terrier", "기타"
    ],
    cat: [
      "Abyssinian", "American Curl", "American Shorthair", "Bengal", "Birman", "Bombay",
      "British Shorthair", "Burmese", "Chartreux", "Cornish Rex", "Devon Rex", "Egyptian Mau",
      "Exotic Shorthair", "Himalayan", "Japanese Bobtail", "Maine Coon", "Manx", "Munchkin",
      "Norwegian Forest", "Oriental Shorthair", "Persian", "Ragdoll", "Russian Blue",
      "Scottish Fold", "Siamese", "Siberian", "Singapura", "Somali", "Sphynx", "Tonkinese",
      "Turkish Angora", "Turkish Van", "기타"
    ],
    other: []
  };

export  const temperamentOptions = [
    "온순함", "활발함", "사교적", "조용함", "장난꾸러기", "차분함",
    "호기심 많음", "독립적", "애교쟁이", "용감함", "신중함", "장난스러움",
    "친근함", "고집스러움", "영리함", "겁쟁이", "적극적", "소심함"
  ];