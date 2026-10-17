
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    const submitButton = document.getElementById("contact-submit");
    const toast = document.getElementById("contact-toast");
    const toastIcon = document.getElementById("contact-toast-icon");
    const toastText = document.getElementById("contact-toast-text");
    const toastClose = document.getElementById("contact-toast-close");

    if (!form || !submitButton || !toast || typeof emailjs === "undefined") {
        console.error("Formulaire de contact ou bibliothèque EmailJS introuvable.");
        return;
    }

    // À remplacer par les identifiants de ton compte EmailJS.
    const PUBLIC_KEY = "Y_p_OrTQJWO6pNUsb";
    const SERVICE_ID = "service_z391kbw";
    const TEMPLATE_ID = "template_0iydp5o";

    let toastTimer;
    let isSending = false;

    emailjs.init({ 
        publicKey: PUBLIC_KEY,
        blockHeadless: true,
        limitRate: {
            id: "portfolio-contact",
            throttle: 10000
        }
    });

    function showToast(message, type = "error") {
        clearTimeout(toastTimer);

        toast.className = `contact-toast ${type}`;
        toastIcon.textContent = type === "success" ? "✓" : "!";
        toastText.textContent = message;

        toast.classList.remove("show");
        void toast.offsetWidth;
        toast.classList.add("show");

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 5000);
    }

    function hideToast() {
        clearTimeout(toastTimer);
        toast.classList.remove("show");
    }

    toastClose.addEventListener("click", hideToast);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isSending) return;
        hideToast();

        // Vérification des champs et des formats HTML.
        if (!form.checkValidity()) {
            const invalidField = form.querySelector(":invalid");
            if (invalidField) invalidField.focus();

            showToast("Certains champs sont vides ou incorrects. Vérifiez le formulaire.");
            form.reportValidity();
            return;
        }

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const subject = document.getElementById("subject");
        const message = document.getElementById("message");

        name.value = name.value.trim();
        email.value = email.value.trim();
        subject.value = subject.value.trim();
        message.value = message.value.trim();

        if (!name.value || !email.value || !subject.value || !message.value) {
            showToast("Veuillez remplir tous les champs avant d'envoyer le message.");
            return;
        }

        if (name.value.length > 100 || email.value.length > 254 ||
            subject.value.length > 150 || message.value.length > 5000) {
            showToast("Un ou plusieurs champs dépassent la longueur autorisée.");
            return;
        }

        if (
            PUBLIC_KEY === "TA_PUBLIC_KEY" ||
            SERVICE_ID === "TON_SERVICE_ID" ||
            TEMPLATE_ID === "TON_TEMPLATE_ID"
        ) {
            showToast("Le service d'envoi n'est pas encore configuré.");
            return;
        }

        isSending = true;
        submitButton.disabled = true;
        submitButton.textContent = "Envoi en cours...";

        try {
            await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
                name: name.value,
                email: email.value,
                subject: subject.value,
                message: message.value
            });

            form.reset();
            showToast("Votre message a bien été envoyé. Merci !", "success");
        } catch (error) {
            console.error("Erreur EmailJS :", error);
            showToast("Impossible d'envoyer le message. Réessayez dans quelques instants.");
        } finally {
            isSending = false;
            submitButton.disabled = false;
            submitButton.textContent = "Envoyer";
        }
    });
});
