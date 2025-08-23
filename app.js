document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('participant-name');
    const photoInput = document.getElementById('participant-photo');
    const dateInput = document.getElementById('workshop-date');
    const setTodayBtn = document.getElementById('set-today');
    const previewBtn = document.getElementById('preview-btn');
    const downloadBtn = document.getElementById('download-btn');
    const previewSection = document.getElementById('certificate-preview-section');
    const form = document.getElementById('certificate-form');
    const previewName = document.getElementById('preview-name');
    const previewDate = document.getElementById('preview-date');
    const previewPhoto = document.getElementById('preview-photo');
    const backBtn = document.getElementById('back-btn');
    const downloadBtnPreview = document.getElementById('download-btn-preview');
    const certNumberElem = document.getElementById('certificate-number');
    const certificateCanvas = document.getElementById('certificate-canvas');
    const previewDesignation = document.getElementById('preview-designation');

    // Set max date to today for workshop-date input
    (function setMaxDate() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.max = `${yyyy}-${mm}-${dd}`;
    })();

    // Live preview for name
    nameInput.addEventListener('input', () => {
        previewName.textContent = nameInput.value.trim() || '[Your Name]';
    });

    // Designation is always fixed
    if (previewDesignation) {
        previewDesignation.textContent = "Aspiring AI Generalist";
    }

    // Live preview for date
    dateInput.addEventListener('input', () => {
        previewDate.textContent = dateInput.value ? formatDate(dateInput.value) : '[Date]';
    });

    // Set today's date
    setTodayBtn.addEventListener('click', () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        previewDate.textContent = formatDate(dateInput.value);
    });

    // Live preview for photo
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            previewPhoto.style.display = 'none';
            previewPhoto.src = '';
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file (JPG or PNG).');
            photoInput.value = '';
            previewPhoto.style.display = 'none';
            previewPhoto.src = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            previewPhoto.src = event.target.result;
            previewPhoto.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });

    // Animate shake on validation error
    function shakeInput(input) {
        input.classList.add('input-error');
        setTimeout(() => input.classList.remove('input-error'), 400);
    }

    // Certificate number (optional, random for demo)
    function generateCertificateNumber() {
        return 'SI-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    }
    if (certNumberElem) {
        certNumberElem.textContent = 'Certificate No: ' + generateCertificateNumber();
    }

    // Dynamically load QRCode library from CDN if not present
    function loadQRCodeLib() {
        return new Promise((resolve, reject) => {
            if (window.QRCode) return resolve();
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    // Generate QR code with participant info (or a link)
    async function renderCertificateQR() {
        await loadQRCodeLib();
        const qrArea = document.getElementById('certificate-qr');
        qrArea.innerHTML = '';
        const qrData = JSON.stringify({
            name: nameInput.value.trim(),
            date: dateInput.value.trim()
        });
        new QRCode(qrArea, {
            text: qrData,
            width: 64,
            height: 64,
            colorDark: "#35424a",
            colorLight: "#fff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // Show preview on next "page"
    previewBtn.addEventListener('click', async () => {
        if (!nameInput.value.trim()) {
            shakeInput(nameInput);
            nameInput.focus();
            return;
        }
        if (!photoInput.files[0]) {
            shakeInput(photoInput);
            photoInput.focus();
            return;
        }
        await renderCertificateQR();
        form.style.display = 'none';
        previewSection.style.display = 'block';
        downloadBtnPreview.style.display = 'inline-block';
    });

    // Back button to return to form
    backBtn.addEventListener('click', () => {
        previewSection.style.display = 'none';
        form.style.display = 'block';
    });

    // Download certificate as high-res PNG using html2canvas
    async function downloadCertificateAsPNG(targetElement, filename) {
        if (typeof html2canvas === 'undefined') {
            await loadHtml2Canvas();
        }
        const downloadBtns = document.querySelectorAll('#download-btn, #download-btn-preview');
        downloadBtns.forEach(btn => btn.style.visibility = 'hidden');
        window.scrollTo(0, 0);
        html2canvas(targetElement, {
            scale: 3,
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            downloadBtns.forEach(btn => btn.style.visibility = 'visible');
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(() => {
            downloadBtns.forEach(btn => btn.style.visibility = 'visible');
            alert('Failed to generate certificate image. Please try again.');
        });
    }

    // Dynamically load html2canvas from CDN if needed
    function loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    // Download from preview page
    downloadBtnPreview.addEventListener('click', async () => {
        await renderCertificateQR();
        await downloadCertificateAsPNG(certificateCanvas, `Certificate_${nameInput.value.trim().replace(/\s+/g, '_')}.png`);
    });

    // Download from form (if needed)
    downloadBtn.addEventListener('click', async () => {
        if (!nameInput.value.trim()) {
            shakeInput(nameInput);
            nameInput.focus();
            return;
        }
        if (!photoInput.files[0]) {
            shakeInput(photoInput);
            photoInput.focus();
            return;
        }
        await renderCertificateQR();
        await downloadCertificateAsPNG(certificateCanvas, `Certificate_${nameInput.value.trim().replace(/\s+/g, '_')}.png`);
    });

    // Prevent form submission (SPA)
    form.addEventListener('submit', e => e.preventDefault());

    // Helper for date formatting
    function formatDate(dateStr) {
        if (!dateStr) return '[Date]';
        const date = new Date(dateStr);
        if (isNaN(date)) return '[Date]';
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
});
