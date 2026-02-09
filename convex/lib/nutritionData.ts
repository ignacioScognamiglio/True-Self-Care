// Seed data for wellness knowledge base (nutrition + exercises)
// Source references: USDA FoodData Central, NSCA Exercise Database

export const NUTRITION_KNOWLEDGE: Array<{
  text: string;
  category: string;
  subcategory: string;
  source: string;
}> = [
  // ═══ PROTEINAS ═══
  {
    text: "Pechuga de pollo (100g): 165 kcal, 31g proteina, 0g carbohidratos, 3.6g grasa. Alta en proteina magra, ideal para hipertrofia y perdida de peso.",
    category: "nutrition",
    subcategory: "proteinas",
    source: "USDA FoodData Central",
  },
  {
    text: "Carne vacuna magra (100g): 250 kcal, 26g proteina, 0g carbohidratos, 15g grasa. Rica en hierro hemo, zinc y vitamina B12.",
    category: "nutrition",
    subcategory: "proteinas",
    source: "USDA FoodData Central",
  },
  {
    text: "Salmon (100g): 208 kcal, 20g proteina, 0g carbohidratos, 13g grasa. Rico en omega-3, excelente para recuperacion muscular y salud cardiovascular.",
    category: "nutrition",
    subcategory: "proteinas",
    source: "USDA FoodData Central",
  },
  {
    text: "Huevo entero (50g): 78 kcal, 6g proteina, 0.6g carbohidratos, 5g grasa. Proteina completa con todos los aminoacidos esenciales.",
    category: "nutrition",
    subcategory: "proteinas",
    source: "USDA FoodData Central",
  },
  {
    text: "Atun en lata al natural (100g): 116 kcal, 26g proteina, 0g carbohidratos, 1g grasa. Practico y economico, alta densidad proteica.",
    category: "nutrition",
    subcategory: "proteinas",
    source: "USDA FoodData Central",
  },
  {
    text: "Cerdo magro (100g): 143 kcal, 21g proteina, 0g carbohidratos, 6g grasa. Buena fuente de tiamina (vitamina B1).",
    category: "nutrition",
    subcategory: "proteinas",
    source: "USDA FoodData Central",
  },
  {
    text: "Merluza (100g): 82 kcal, 18g proteina, 0g carbohidratos, 1g grasa. Pescado blanco bajo en calorias, ideal para dietas hipocaloricas.",
    category: "nutrition",
    subcategory: "proteinas",
    source: "USDA FoodData Central",
  },

  // ═══ LACTEOS ═══
  {
    text: "Yogurt griego natural (100g): 97 kcal, 9g proteina, 3.6g carbohidratos, 5g grasa. Alto en proteina, probioticos para salud digestiva.",
    category: "nutrition",
    subcategory: "lacteos",
    source: "USDA FoodData Central",
  },
  {
    text: "Queso cottage (100g): 98 kcal, 11g proteina, 3.4g carbohidratos, 4.3g grasa. Caseina de liberacion lenta, ideal antes de dormir.",
    category: "nutrition",
    subcategory: "lacteos",
    source: "USDA FoodData Central",
  },
  {
    text: "Leche descremada (250ml): 83 kcal, 8g proteina, 12g carbohidratos, 0.2g grasa. Buena fuente de calcio y vitamina D.",
    category: "nutrition",
    subcategory: "lacteos",
    source: "USDA FoodData Central",
  },
  {
    text: "Queso muzzarella (100g): 280 kcal, 28g proteina, 3g carbohidratos, 17g grasa. Rico en calcio y proteina.",
    category: "nutrition",
    subcategory: "lacteos",
    source: "USDA FoodData Central",
  },

  // ═══ CARBOHIDRATOS ═══
  {
    text: "Arroz blanco cocido (100g): 130 kcal, 2.7g proteina, 28g carbohidratos, 0.3g grasa. Fuente de carbohidratos de facil digestion.",
    category: "nutrition",
    subcategory: "carbohidratos",
    source: "USDA FoodData Central",
  },
  {
    text: "Arroz integral cocido (100g): 123 kcal, 2.7g proteina, 26g carbohidratos, 1g grasa. Mayor fibra y micronutrientes que el arroz blanco.",
    category: "nutrition",
    subcategory: "carbohidratos",
    source: "USDA FoodData Central",
  },
  {
    text: "Avena en copos (100g): 389 kcal, 17g proteina, 66g carbohidratos, 7g grasa. Rica en fibra soluble (beta-glucano), excelente para desayuno.",
    category: "nutrition",
    subcategory: "carbohidratos",
    source: "USDA FoodData Central",
  },
  {
    text: "Papa cocida (100g): 87 kcal, 1.9g proteina, 20g carbohidratos, 0.1g grasa. Alta saciedad, buena fuente de potasio y vitamina C.",
    category: "nutrition",
    subcategory: "carbohidratos",
    source: "USDA FoodData Central",
  },
  {
    text: "Batata/Boniato cocido (100g): 90 kcal, 2g proteina, 21g carbohidratos, 0.1g grasa. Rica en vitamina A y fibra.",
    category: "nutrition",
    subcategory: "carbohidratos",
    source: "USDA FoodData Central",
  },
  {
    text: "Pan integral (1 rebanada, 30g): 69 kcal, 3.6g proteina, 12g carbohidratos, 1g grasa. Mas fibra y nutrientes que pan blanco.",
    category: "nutrition",
    subcategory: "carbohidratos",
    source: "USDA FoodData Central",
  },
  {
    text: "Fideos cocidos (100g): 131 kcal, 5g proteina, 25g carbohidratos, 1.1g grasa. Fuente de energia, preferir variedades integrales.",
    category: "nutrition",
    subcategory: "carbohidratos",
    source: "USDA FoodData Central",
  },

  // ═══ LEGUMBRES ═══
  {
    text: "Lentejas cocidas (100g): 116 kcal, 9g proteina, 20g carbohidratos, 0.4g grasa. Excelente fuente de hierro vegetal y fibra.",
    category: "nutrition",
    subcategory: "legumbres",
    source: "USDA FoodData Central",
  },
  {
    text: "Garbanzos cocidos (100g): 164 kcal, 9g proteina, 27g carbohidratos, 2.6g grasa. Versatiles, ricos en fibra y folato.",
    category: "nutrition",
    subcategory: "legumbres",
    source: "USDA FoodData Central",
  },
  {
    text: "Porotos negros cocidos (100g): 132 kcal, 9g proteina, 24g carbohidratos, 0.5g grasa. Altos en fibra, hierro y antioxidantes.",
    category: "nutrition",
    subcategory: "legumbres",
    source: "USDA FoodData Central",
  },

  // ═══ FRUTAS ═══
  {
    text: "Banana (100g): 89 kcal, 1.1g proteina, 23g carbohidratos, 0.3g grasa. Rica en potasio, ideal como snack pre-entrenamiento.",
    category: "nutrition",
    subcategory: "frutas",
    source: "USDA FoodData Central",
  },
  {
    text: "Manzana (100g): 52 kcal, 0.3g proteina, 14g carbohidratos, 0.2g grasa. Rica en fibra (pectina), buena para saciedad.",
    category: "nutrition",
    subcategory: "frutas",
    source: "USDA FoodData Central",
  },
  {
    text: "Naranja (100g): 47 kcal, 0.9g proteina, 12g carbohidratos, 0.1g grasa. Rica en vitamina C, ideal post-entrenamiento.",
    category: "nutrition",
    subcategory: "frutas",
    source: "USDA FoodData Central",
  },
  {
    text: "Arandanos (100g): 57 kcal, 0.7g proteina, 14g carbohidratos, 0.3g grasa. Altos en antioxidantes, antiinflamatorios.",
    category: "nutrition",
    subcategory: "frutas",
    source: "USDA FoodData Central",
  },
  {
    text: "Frutilla/Fresa (100g): 32 kcal, 0.7g proteina, 8g carbohidratos, 0.3g grasa. Baja en calorias, alta en vitamina C.",
    category: "nutrition",
    subcategory: "frutas",
    source: "USDA FoodData Central",
  },
  {
    text: "Palta/Aguacate (100g): 160 kcal, 2g proteina, 9g carbohidratos, 15g grasa. Rica en grasas monoinsaturadas saludables y potasio.",
    category: "nutrition",
    subcategory: "frutas",
    source: "USDA FoodData Central",
  },

  // ═══ VERDURAS ═══
  {
    text: "Brocoli cocido (100g): 35 kcal, 2.4g proteina, 7g carbohidratos, 0.4g grasa. Alto en vitamina C, K y fibra. Propiedades anticancerigenas.",
    category: "nutrition",
    subcategory: "verduras",
    source: "USDA FoodData Central",
  },
  {
    text: "Espinaca cruda (100g): 23 kcal, 2.9g proteina, 3.6g carbohidratos, 0.4g grasa. Rica en hierro, calcio y vitaminas A y K.",
    category: "nutrition",
    subcategory: "verduras",
    source: "USDA FoodData Central",
  },
  {
    text: "Tomate (100g): 18 kcal, 0.9g proteina, 3.9g carbohidratos, 0.2g grasa. Rico en licopeno (antioxidante), vitaminas A y C.",
    category: "nutrition",
    subcategory: "verduras",
    source: "USDA FoodData Central",
  },
  {
    text: "Zanahoria (100g): 41 kcal, 0.9g proteina, 10g carbohidratos, 0.2g grasa. Rica en betacaroteno (vitamina A).",
    category: "nutrition",
    subcategory: "verduras",
    source: "USDA FoodData Central",
  },
  {
    text: "Zapallo/Calabaza cocido (100g): 26 kcal, 1g proteina, 6.5g carbohidratos, 0.1g grasa. Rico en vitamina A y fibra.",
    category: "nutrition",
    subcategory: "verduras",
    source: "USDA FoodData Central",
  },
  {
    text: "Lechuga (100g): 15 kcal, 1.4g proteina, 2.9g carbohidratos, 0.2g grasa. Base para ensaladas, minimas calorias.",
    category: "nutrition",
    subcategory: "verduras",
    source: "USDA FoodData Central",
  },

  // ═══ GRASAS SALUDABLES ═══
  {
    text: "Aceite de oliva (1 cda, 14ml): 119 kcal, 0g proteina, 0g carbohidratos, 14g grasa. Rico en acido oleico, antiinflamatorio.",
    category: "nutrition",
    subcategory: "grasas",
    source: "USDA FoodData Central",
  },
  {
    text: "Almendras (30g): 164 kcal, 6g proteina, 6g carbohidratos, 14g grasa. Ricas en vitamina E, magnesio y fibra.",
    category: "nutrition",
    subcategory: "grasas",
    source: "USDA FoodData Central",
  },
  {
    text: "Nueces (30g): 185 kcal, 4.3g proteina, 3.9g carbohidratos, 18g grasa. Altas en omega-3, beneficios cognitivos.",
    category: "nutrition",
    subcategory: "grasas",
    source: "USDA FoodData Central",
  },
  {
    text: "Mani/Cacahuate (30g): 170 kcal, 7g proteina, 5g carbohidratos, 14g grasa. Snack calorico denso, buena proteina vegetal.",
    category: "nutrition",
    subcategory: "grasas",
    source: "USDA FoodData Central",
  },
  {
    text: "Semillas de chia (15g): 73 kcal, 2.5g proteina, 6g carbohidratos, 4.6g grasa. Altas en omega-3 vegetal, fibra y calcio.",
    category: "nutrition",
    subcategory: "grasas",
    source: "USDA FoodData Central",
  },
  {
    text: "Manteca de mani/cacahuate (2 cdas, 32g): 188 kcal, 8g proteina, 6g carbohidratos, 16g grasa. Practica y calorica, buena para volumen.",
    category: "nutrition",
    subcategory: "grasas",
    source: "USDA FoodData Central",
  },

  // ═══ SNACKS SALUDABLES ═══
  {
    text: "Barrita de cereal (30g): 120 kcal, 2g proteina, 22g carbohidratos, 3g grasa. Snack rapido, preferir opciones con bajo azucar.",
    category: "nutrition",
    subcategory: "snacks",
    source: "USDA FoodData Central",
  },
  {
    text: "Whey protein (1 scoop, 30g): 120 kcal, 24g proteina, 3g carbohidratos, 1.5g grasa. Suplemento de proteina de rapida absorcion.",
    category: "nutrition",
    subcategory: "suplementos",
    source: "USDA FoodData Central",
  },

  // ═══ GUIAS NUTRICIONALES ═══
  {
    text: "Para perdida de peso: deficit calorico de 300-500 kcal/dia. Proteina alta (1.6-2.2g/kg), carbohidratos moderados, grasas minimo 0.8g/kg. Priorizar alimentos saciantes y ricos en fibra.",
    category: "nutrition",
    subcategory: "guias",
    source: "ISSN Position Stand",
  },
  {
    text: "Para ganancia muscular: superavit calorico de 200-400 kcal/dia. Proteina 1.6-2.2g/kg, carbohidratos 4-7g/kg, grasas 0.8-1.2g/kg. Distribuir proteina en 4-5 comidas.",
    category: "nutrition",
    subcategory: "guias",
    source: "ISSN Position Stand",
  },
  {
    text: "Para mantenimiento: calorias en TDEE. Proteina 1.2-1.6g/kg, balance de macros flexible. Enfocarse en calidad de alimentos y variedad.",
    category: "nutrition",
    subcategory: "guias",
    source: "ISSN Position Stand",
  },
  {
    text: "Hidratacion: 35ml por kg de peso corporal al dia. Aumentar 500-1000ml en dias de ejercicio. Agua es la mejor opcion, evitar bebidas azucaradas.",
    category: "nutrition",
    subcategory: "guias",
    source: "ACSM Guidelines",
  },
  {
    text: "Pre-entrenamiento (1-2h antes): comida con carbohidratos de facil digestion y proteina moderada. Ejemplo: banana con yogurt griego, o avena con whey.",
    category: "nutrition",
    subcategory: "guias",
    source: "ISSN Position Stand",
  },
  {
    text: "Post-entrenamiento (dentro de 2h): 20-40g proteina + carbohidratos para reposicion de glucogeno. Ejemplo: pollo con arroz, o batido con whey y fruta.",
    category: "nutrition",
    subcategory: "guias",
    source: "ISSN Position Stand",
  },
];

export const EXERCISE_KNOWLEDGE: Array<{
  text: string;
  category: string;
  subcategory: string;
  source: string;
}> = [
  // ═══ PECHO ═══
  {
    text: "Press de banca: Ejercicio compuesto para pectoral mayor, deltoides anterior y triceps. 3-4 series de 8-12 reps para hipertrofia. Tecnica: retraccion escapular, arco natural, barra al pecho.",
    category: "fitness",
    subcategory: "pecho",
    source: "NSCA Exercise Database",
  },
  {
    text: "Press inclinado con mancuernas: Enfasis en pectoral superior. 3-4 series de 10-12 reps. Angulo de 30-45 grados. Rango completo de movimiento.",
    category: "fitness",
    subcategory: "pecho",
    source: "NSCA Exercise Database",
  },
  {
    text: "Aperturas con mancuernas: Aislamiento de pectoral. 3 series de 12-15 reps. Codos ligeramente flexionados, movimiento en arco. Buen ejercicio complementario.",
    category: "fitness",
    subcategory: "pecho",
    source: "NSCA Exercise Database",
  },

  // ═══ ESPALDA ═══
  {
    text: "Dominadas/Pull-ups: Ejercicio compuesto para dorsal ancho, biceps y core. Agarre prono ancho para enfasis en dorsal. 3-4 series al fallo o cerca del fallo.",
    category: "fitness",
    subcategory: "espalda",
    source: "NSCA Exercise Database",
  },
  {
    text: "Remo con barra: Ejercicio compuesto para espalda media, dorsal y biceps. 3-4 series de 8-12 reps. Torso a 45 grados, llevar barra al ombligo.",
    category: "fitness",
    subcategory: "espalda",
    source: "NSCA Exercise Database",
  },
  {
    text: "Peso muerto: Ejercicio compuesto para cadena posterior (gluteos, isquiotibiales, erectores). 3-5 series de 5-8 reps para fuerza. Mantener espalda neutra.",
    category: "fitness",
    subcategory: "espalda",
    source: "NSCA Exercise Database",
  },
  {
    text: "Remo con mancuerna unilateral: Trabaja dorsal ancho y romboides. 3 series de 10-12 reps por lado. Permite corregir desbalances musculares.",
    category: "fitness",
    subcategory: "espalda",
    source: "NSCA Exercise Database",
  },

  // ═══ PIERNAS ═══
  {
    text: "Sentadilla con barra: Ejercicio compuesto para cuadriceps, gluteos y core. 3-5 series de 5-8 reps para fuerza, 3-4 series de 8-12 para hipertrofia. Profundidad minima: paralelo.",
    category: "fitness",
    subcategory: "piernas",
    source: "NSCA Exercise Database",
  },
  {
    text: "Prensa de piernas: Alternativa a sentadilla, menor demanda de estabilizacion. 3-4 series de 10-15 reps. No bloquear rodillas al extender.",
    category: "fitness",
    subcategory: "piernas",
    source: "NSCA Exercise Database",
  },
  {
    text: "Zancadas/Lunges: Ejercicio unilateral para cuadriceps y gluteos. 3 series de 10-12 reps por pierna. Mejora equilibrio y corrige asimetrias.",
    category: "fitness",
    subcategory: "piernas",
    source: "NSCA Exercise Database",
  },
  {
    text: "Curl femoral: Aislamiento de isquiotibiales. 3-4 series de 10-15 reps. Importante para balance cuadriceps/isquiotibiales y prevencion de lesiones.",
    category: "fitness",
    subcategory: "piernas",
    source: "NSCA Exercise Database",
  },
  {
    text: "Elevacion de gemelos: Aislamiento de pantorrillas. 4-5 series de 15-20 reps. Rango completo (estiramiento abajo, contraccion arriba). Entrenar con frecuencia.",
    category: "fitness",
    subcategory: "piernas",
    source: "NSCA Exercise Database",
  },

  // ═══ HOMBROS ═══
  {
    text: "Press militar con barra: Ejercicio compuesto para deltoides y triceps. 3-4 series de 8-10 reps. De pie o sentado, no arquear excesivamente la espalda.",
    category: "fitness",
    subcategory: "hombros",
    source: "NSCA Exercise Database",
  },
  {
    text: "Elevaciones laterales: Aislamiento de deltoides lateral. 3-4 series de 12-15 reps. Peso moderado, controlar el movimiento. No balancear el cuerpo.",
    category: "fitness",
    subcategory: "hombros",
    source: "NSCA Exercise Database",
  },
  {
    text: "Face pulls: Deltoides posterior y rotadores externos. 3-4 series de 15-20 reps. Excelente para salud del hombro y postura.",
    category: "fitness",
    subcategory: "hombros",
    source: "NSCA Exercise Database",
  },

  // ═══ BRAZOS ═══
  {
    text: "Curl de biceps con barra: Aislamiento de biceps. 3 series de 10-12 reps. No balancear el cuerpo, contraccion controlada.",
    category: "fitness",
    subcategory: "brazos",
    source: "NSCA Exercise Database",
  },
  {
    text: "Extension de triceps (polea): Aislamiento de triceps. 3 series de 12-15 reps. Codos pegados al cuerpo, solo mover el antebrazo.",
    category: "fitness",
    subcategory: "brazos",
    source: "NSCA Exercise Database",
  },
  {
    text: "Fondos en paralelas: Compuesto para triceps y pectoral inferior. 3 series de 8-12 reps. Inclinarse adelante enfatiza pecho, vertical enfatiza triceps.",
    category: "fitness",
    subcategory: "brazos",
    source: "NSCA Exercise Database",
  },

  // ═══ CORE ═══
  {
    text: "Plancha frontal: Isometrico para core completo. 3 series de 30-60 segundos. Mantener cuerpo recto, no dejar caer la cadera.",
    category: "fitness",
    subcategory: "core",
    source: "NSCA Exercise Database",
  },
  {
    text: "Crunch abdominal: Aislamiento de recto abdominal. 3 series de 15-20 reps. Movimiento corto y controlado, no tirar del cuello.",
    category: "fitness",
    subcategory: "core",
    source: "NSCA Exercise Database",
  },
  {
    text: "Russian twist: Oblicuos y rotacion de tronco. 3 series de 15-20 reps por lado. Se puede agregar peso para progresion.",
    category: "fitness",
    subcategory: "core",
    source: "NSCA Exercise Database",
  },

  // ═══ CARDIO ═══
  {
    text: "Correr/Trotar: Cardio de estado estable. 20-40 minutos a intensidad moderada (60-70% FC max). Quema aprox 400-600 kcal/hora. Mejora resistencia aerobica.",
    category: "fitness",
    subcategory: "cardio",
    source: "ACSM Guidelines",
  },
  {
    text: "HIIT (entrenamiento intervalico): Alternar alta y baja intensidad. 15-25 minutos. Ejemplo: 30s sprint + 60s caminata. Quema mas grasa en menos tiempo.",
    category: "fitness",
    subcategory: "cardio",
    source: "ACSM Guidelines",
  },
  {
    text: "Bicicleta estacionaria: Bajo impacto articular. 20-40 minutos. Ideal para cardio sin estres en rodillas. Ajustar resistencia para mayor desafio.",
    category: "fitness",
    subcategory: "cardio",
    source: "ACSM Guidelines",
  },
  {
    text: "Saltar la cuerda: Cardio de alta intensidad. 10-20 minutos. Quema aprox 700-1000 kcal/hora. Mejora coordinacion y agilidad.",
    category: "fitness",
    subcategory: "cardio",
    source: "ACSM Guidelines",
  },

  // ═══ FLEXIBILIDAD ═══
  {
    text: "Estiramiento de isquiotibiales: Sentado, piernas extendidas, alcanzar los pies. Mantener 20-30 segundos. Previene lesiones de espalda baja.",
    category: "fitness",
    subcategory: "flexibilidad",
    source: "ACSM Guidelines",
  },
  {
    text: "Estiramiento de cadera (hip flexor): Posicion de zancada, rodilla trasera en el piso. 20-30 segundos por lado. Importante para personas que pasan mucho tiempo sentadas.",
    category: "fitness",
    subcategory: "flexibilidad",
    source: "ACSM Guidelines",
  },
  {
    text: "Estiramiento de pectoral en puerta: Brazo a 90 grados en el marco de la puerta, girar el cuerpo. 20-30 segundos por lado. Mejora postura.",
    category: "fitness",
    subcategory: "flexibilidad",
    source: "ACSM Guidelines",
  },

  // ═══ GUIAS DE ENTRENAMIENTO ═══
  {
    text: "Principiantes: 3 dias/semana de cuerpo completo. Enfocarse en ejercicios compuestos (sentadilla, press de banca, remo, peso muerto). 3 series de 10-12 reps. Descanso 60-90s.",
    category: "fitness",
    subcategory: "guias",
    source: "NSCA Guidelines",
  },
  {
    text: "Intermedios: 4 dias/semana, division tren superior/inferior o push/pull/legs. Mayor volumen por grupo muscular. 4 series, variando rangos de reps.",
    category: "fitness",
    subcategory: "guias",
    source: "NSCA Guidelines",
  },
  {
    text: "Avanzados: 5-6 dias/semana, division por grupo muscular. Alto volumen con periodizacion. Incluir tecnicas de intensidad (dropsets, superseries).",
    category: "fitness",
    subcategory: "guias",
    source: "NSCA Guidelines",
  },
  {
    text: "Descanso entre series: Fuerza 2-5 min, hipertrofia 60-120s, resistencia 30-60s. Ajustar segun la respuesta personal y la calidad de las series.",
    category: "fitness",
    subcategory: "guias",
    source: "NSCA Guidelines",
  },
  {
    text: "Progresion de carga: Aumentar peso cuando se completen todas las series y reps con buena tecnica. Incrementos de 2.5-5kg para tren superior, 5-10kg para tren inferior.",
    category: "fitness",
    subcategory: "guias",
    source: "NSCA Guidelines",
  },
];
