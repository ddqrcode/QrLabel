document.addEventListener('DOMContentLoaded', () => {
    // 1. Leggi i parametri dall'URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('qr'); // 'qr' è il nome del parametro atteso
    let lang = urlParams.get('lang') || 'it'; // Default a 'it'

    // Seleziona gli elementi HTML da aggiornare
    const pageTitleElement = document.querySelector('title');
    const productNameElement = document.getElementById('product-name');
    const nutritionTableBody = document.getElementById('nutrition-table-body'); // Corpo tabella
    const nutriEnergyElement = document.getElementById('nutri-energy');
    const nutriFatElement = document.getElementById('nutri-fat');
    const nutriSaturatedFatElement = document.getElementById('nutri-saturated-fat');
    const nutriCarbsElement = document.getElementById('nutri-carbs');
    const nutriSugarsElement = document.getElementById('nutri-sugars');
    const nutriProteinElement = document.getElementById('nutri-protein');
    const nutriSaltElement = document.getElementById('nutri-salt');
    const ingredientsListElement = document.getElementById('ingredients-list');
    const alcoholPercentageElement = document.getElementById('alcoholPercentage');
    const serviceTemperatureElement = document.getElementById('serviceTemperature');
    const allergensInfoElement = document.getElementById('allergens-info'); // Potrebbe non servire se inclusi in ingredients
    const disposalImageElement = document.getElementById('disposal-image');
    const disposalTextContainer = document.getElementById('disposal-text-container');
    const consumptionImageElement = document.getElementById('consumption-image'); // Già nell'HTML statico ma si può controllare

    // Funzione per mostrare errori
    function displayError(message) {
        productNameElement.textContent = "Errore";
        ingredientsListElement.textContent = message;
        // Nascondi o pulisci altri campi
        if (nutritionTableBody) nutritionTableBody.innerHTML = '<tr><td colspan="2">Dati non disponibili</td></tr>';
        if (disposalImageElement) disposalImageElement.style.display = 'none';
        if (disposalTextContainer) disposalTextContainer.innerHTML = '';
    }

    // 2. Verifica se l'ID del prodotto è presente
    if (!productId) {
        displayError("Identificativo del prodotto mancante nell'URL (parametro 'qr').");
        return;
    }

    // 3. Carica il file JSON dei prodotti
    fetch('data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 4. Trova i dati del prodotto specifico
            const productData = data[productId];

            if (productData) {
                // 5. Popola la pagina con i dati
                // --- Lingua ---
                // Se la lingua richiesta non esiste per un campo, usa 'it' come fallback
                const currentLang = productData.name[lang] ? lang : 'it';
                document.documentElement.lang = currentLang; // Imposta lingua pagina

                // --- Titolo e Nome Prodotto ---
                const productName = productData.name[currentLang] || 'Nome non disponibile';
                pageTitleElement.textContent = productName;
                productNameElement.textContent = productName;

                // --- Nutrizione ---
                const nutrition = productData.nutrition;
                if (nutrition && nutritionTableBody) {
                     nutriEnergyElement.textContent = `${nutrition.energy_kj || 'N/D'} kJ / ${nutrition.energy_kcal || 'N/D'} kcal`;
                     nutriFatElement.textContent = `${nutrition.fat ?? 'N/D'} g`; // Usa ?? per gestire 0
                     nutriSaturatedFatElement.textContent = `${nutrition.saturated_fat ?? 'N/D'} g`;
                     nutriCarbsElement.textContent = `${nutrition.carbs ?? 'N/D'} g`;
                     nutriSugarsElement.textContent = `${nutrition.sugars ?? 'N/D'} g`;
                     nutriProteinElement.textContent = `${nutrition.protein ?? 'N/D'} g`;
                     nutriSaltElement.textContent = `${nutrition.salt ?? 'N/D'} g`;
                } else if (nutritionTableBody) {
                    nutritionTableBody.innerHTML = '<tr><td colspan="2">Dati nutrizionali non disponibili</td></tr>';
                }

                // --- Ingredienti ---
                if (productData.ingredients && productData.ingredients[currentLang]) {
                    // Usiamo innerHTML perché il JSON contiene tag <strong> e <br>
                    ingredientsListElement.innerHTML = productData.ingredients[currentLang];
                    allergensInfoElement.innerHTML = ""; // Pulisci se usi un campo separato
                } else {
                    ingredientsListElement.textContent = 'Ingredienti non disponibili.';
                     allergensInfoElement.innerHTML = "";
                }

                // --- Caratteristiche ---
                if (productData.alcoholPercentage && productData.serviceTemperature) {
                    alcoholPercentageElement.textContent = productData.alcoholPercentage;
                    serviceTemperatureElement.textContent = productData.serviceTemperature;
                }

                // --- Smaltimento ---
                if (productData.disposal) {
                    // Immagine
                    if (productData.disposal.image && disposalImageElement) {
                        disposalImageElement.src = productData.disposal.image;
                        disposalImageElement.alt = `Indicazioni smaltimento ${productName}`;
                        disposalImageElement.style.display = 'block'; // Mostra l'immagine
                    } else if (disposalImageElement) {
                         disposalImageElement.style.display = 'none'; // Nascondi se non c'è immagine
                    }
                    // Testo (crea paragrafi dall'array)
                    if (productData.disposal.text && productData.disposal.text[currentLang] && disposalTextContainer) {
                         disposalTextContainer.innerHTML = ''; // Pulisci il contenitore
                         productData.disposal.text[currentLang].forEach(paragraph => {
                             const pElement = document.createElement('p');
                             pElement.className = 'mt-3'; // Aggiungi classe bootstrap se serve
                             pElement.textContent = paragraph;
                             disposalTextContainer.appendChild(pElement);
                         });
                    } else if (disposalTextContainer) {
                        disposalTextContainer.innerHTML = '<p class="mt-3">Informazioni sullo smaltimento non disponibili.</p>';
                    }
                } else {
                     if (disposalImageElement) disposalImageElement.style.display = 'none';
                     if (disposalTextContainer) disposalTextContainer.innerHTML = '<p class="mt-3">Informazioni sullo smaltimento non disponibili.</p>';
                }

                 // --- Immagine Consumo Responsabile (Opzionale, se dovesse cambiare) ---
                 if (productData.consumption && productData.consumption.image && consumptionImageElement) {
                     consumptionImageElement.src = productData.consumption.image;
                 }

            } else {
                // Prodotto non trovato nel JSON
                displayError(`Informazioni non trovate per il prodotto con codice: ${productId}`);
            }
        })
        .catch(error => {
            console.error('Errore nel caricamento o elaborazione dei dati:', error);
            displayError("Impossibile caricare le informazioni sull'etichetta. Si è verificato un problema.");
        });

});

