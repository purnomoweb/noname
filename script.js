document.addEventListener('DOMContentLoaded', function() {
    // Tab switching logic
    const btnRekber = document.getElementById('btn-rekber');
    const btnConvert = document.getElementById('btn-convert');
    const btnApps = document.getElementById('btn-apps');
    const panelRekber = document.getElementById('panel-rekber');
    const panelConvert = document.getElementById('panel-convert');
    const panelApps = document.getElementById('panel-apps');
    const tabButtons = [btnRekber, btnConvert, btnApps];
    const panels = [panelRekber, panelConvert, panelApps];

    function switchTab(activeIndex) {
        tabButtons.forEach((button, index) => {
            if (index === activeIndex) {
                button.classList.add('active');
                panels[index].classList.remove('hidden');
            } else {
                button.classList.remove('active');
                panels[index].classList.add('hidden');
            }
        });
    }

    btnRekber.addEventListener('click', () => switchTab(0));
    btnConvert.addEventListener('click', () => switchTab(1));
    btnApps.addEventListener('click', () => switchTab(2));
    
    // Initial State changed to Fee Convert
    switchTab(1); 

    // --- Accordion Logic ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach((header, index) => {
        // Open the first accordion by default
        if (index === 0) {
             const body = header.nextElementSibling;
             const icon = header.querySelector('svg');
             body.classList.add('open');
             icon.style.transform = 'rotate(180deg)';
        }

        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const icon = header.querySelector('svg');
            
            body.classList.toggle('open');
            if (body.classList.contains('open')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });

    // --- Kalkulator Logic ---
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

    const rekberAmountInput = document.getElementById('rekber-amount');
    const platformFeeRadios = document.querySelectorAll('input[name="platform-fee"]');
    const rekberFeeSpan = document.getElementById('rekber-fee');
    const rekberAdditionalFeeSpan = document.getElementById('rekber-additional-fee');
    const rekberAdditionalFeeLine = document.getElementById('rekber-additional-fee-line');
    const rekberTotalSpan = document.getElementById('rekber-total');
    
    const convertAmountInput = document.getElementById('convert-amount');
    const convertFeeSpan = document.getElementById('convert-fee');
    const convertReceivedSpan = document.getElementById('convert-received');
    const convertTypeRadios = document.querySelectorAll('input[name="convert-type"]');

    function formatNumberInput(event) {
        let input = event.target;
        let value = input.value.replace(/\D/g, ''); // Remove all non-digit characters
        
        if (value) {
            let formattedValue = new Intl.NumberFormat('id-ID').format(value);
            input.value = formattedValue;
        } else {
            input.value = '';
        }
    }
    
    rekberAmountInput.addEventListener('input', (e) => {
        formatNumberInput(e);
        calculateRekberFee();
    });
    convertAmountInput.addEventListener('input', (e) => {
        formatNumberInput(e);
        calculateConvertFee();
    });
    platformFeeRadios.forEach(radio => radio.addEventListener('change', calculateRekberFee));
    convertTypeRadios.forEach(radio => radio.addEventListener('change', calculateConvertFee));

    function calculateRekberFee() {
        const cleanValue = rekberAmountInput.value.replace(/\./g, '');
        const amount = parseInt(cleanValue) || 0;
        let standardFee = 0;
        
        if (amount >= 1000 && amount <= 10999) standardFee = 500;
        else if (amount >= 11000 && amount <= 50999) standardFee = 1000;
        else if (amount >= 51000 && amount <= 100999) standardFee = 1500;
        else if (amount >= 101000 && amount <= 150999) standardFee = 2000;
        else if (amount >= 151000 && amount <= 200999) standardFee = 2500;
        else if (amount >= 201000 && amount <= 250999) standardFee = 3000;
        else if (amount >= 251000 && amount <= 300999) standardFee = 3500;
        else if (amount >= 301000 && amount <= 350999) standardFee = 4000;
        else if (amount >= 351000 && amount <= 400999) standardFee = 4500;
        else if (amount >= 401000 && amount <= 450999) standardFee = 5000;
        else if (amount >= 451000 && amount <= 500999) standardFee = 5500;
        else if (amount > 500999) {
            const baseFee = 5500;
            const extraAmount = amount - 500999;
            const extraFee = Math.ceil(extraAmount / 50000) * 500;
            standardFee = baseFee + extraFee;
        }

        let additionalFee = 0;
        const selectedPlatformFee = document.querySelector('input[name="platform-fee"]:checked').value;

        if (selectedPlatformFee === 'prem' && amount > 0) {
            additionalFee = calculateConvertFeeLogic('prem', amount);
            rekberAdditionalFeeLine.classList.remove('hidden');
        } else if (selectedPlatformFee === 'nonprem' && amount > 0) {
            additionalFee = calculateConvertFeeLogic('nonprem', amount);
            rekberAdditionalFeeLine.classList.remove('hidden');
        } else {
            rekberAdditionalFeeLine.classList.add('hidden');
        }

        const total = amount + standardFee + additionalFee;
        rekberFeeSpan.textContent = formatter.format(standardFee);
        rekberAdditionalFeeSpan.textContent = formatter.format(additionalFee);
        rekberTotalSpan.textContent = formatter.format(total);
    }
    
    function calculateConvertFee() {
        const cleanValue = convertAmountInput.value.replace(/\./g, '');
        const amount = parseInt(cleanValue) || 0;
        const type = document.querySelector('input[name="convert-type"]:checked').value;
        const fee = calculateConvertFeeLogic(type, amount);
        const received = amount - fee;
        
        convertFeeSpan.textContent = formatter.format(Math.round(fee));
        convertReceivedSpan.textContent = formatter.format(Math.round(received));
    }

    function calculateConvertFeeLogic(type, amount) {
        let fee = 0;
        if (type === 'prem') {
            if (amount >= 0 && amount <= 199999) fee = 1000;
            else if (amount <= 299999) fee = 2000;
            else if (amount <= 399999) fee = 3000;
            else if (amount <= 499999) fee = 4000;
            else if (amount <= 599999) fee = 5000;
            else if (amount >= 600000) {
                const extraAmount = amount - 599999;
                const feeIncrements = Math.ceil(extraAmount / 100000);
                fee = 5000 + (feeIncrements * 1000);
            }
        } else { // nonprem logic
            if (amount >= 0 && amount <= 19999) fee = 2000;
            else if (amount <= 49999) fee = 3000;
            else if (amount <= 99999) fee = 4000;
            else if (amount <= 199999) fee = 6000;
            else if (amount <= 299999) fee = 8000;
            else if (amount <= 399999) fee = 10000;
            else if (amount <= 499999) fee = 12000;
            else if (amount >= 500000) {
                const baseFee = 12000;
                const extraAmount = amount - 499999;
                const feeIncrements = Math.ceil(extraAmount / 100000);
                fee = baseFee + (feeIncrements * 2000);
            }
        }
        return fee;
    }

    // Initial calculation on page load
    calculateRekberFee();
    calculateConvertFee();
});