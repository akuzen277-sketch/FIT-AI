document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const phoneInput = document.getElementById('phone-input');
    const resultsSection = document.getElementById('results-section');
    
    // Results elements
    const waLink = document.getElementById('wa-link');
    const resCountry = document.getElementById('res-country');
    const resCarrier = document.getElementById('res-carrier');
    const resType = document.getElementById('res-type');
    const resValid = document.getElementById('res-valid');
    
    // Quick links
    const googleLink = document.getElementById('google-link');
    const truecallerLink = document.getElementById('truecaller-link');
    const facebookLink = document.getElementById('facebook-link');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const rawNumber = phoneInput.value.replace(/\D/g, ''); // Remove non-digits
        
        if (rawNumber.length < 5) {
            alert('Please enter a valid phone number.');
            return;
        }

        // 1. Generate WhatsApp Link
        waLink.href = `https://wa.me/${rawNumber}`;

        // 2. Generate OSINT Links
        googleLink.href = `https://www.google.com/search?q=%22%2B${rawNumber}%22+OR+%22${rawNumber}%22`;
        truecallerLink.href = `https://www.truecaller.com/search/global/${rawNumber}`;
        facebookLink.href = `https://www.facebook.com/search/top?q=%2B${rawNumber}`;

        // 3. Mock OSINT API Response (since we don't have a real API key)
        simulateApiFetch(rawNumber);
    });

    function simulateApiFetch(number) {
        // Show loading state
        resultsSection.classList.remove('hidden');
        resCountry.textContent = 'Loading...';
        resCarrier.textContent = 'Loading...';
        resType.textContent = 'Loading...';
        resValid.textContent = 'Loading...';

        setTimeout(() => {
            // Very simple mock logic based on number length and starting digits
            const isValid = number.length >= 10 && number.length <= 15;
            let country = 'Unknown';
            let carrier = 'Unknown Network';
            
            if (number.startsWith('1')) { country = 'United States / Canada'; carrier = 'AT&T / Verizon'; }
            else if (number.startsWith('44')) { country = 'United Kingdom'; carrier = 'Vodafone / EE'; }
            else if (number.startsWith('91')) { country = 'India'; carrier = 'Jio / Airtel'; }
            else if (number.startsWith('61')) { country = 'Australia'; carrier = 'Telstra'; }
            else if (number.startsWith('49')) { country = 'Germany'; carrier = 'Deutsche Telekom'; }
            else { country = 'International'; carrier = 'Global Provider'; }

            resValid.textContent = isValid ? 'Yes ✅' : 'No ❌';
            resValid.style.color = isValid ? '#25D366' : '#ef4444';
            
            resCountry.textContent = country;
            resCarrier.textContent = carrier;
            resType.textContent = 'Mobile';
        }, 800); // Simulate network delay
    }
});
