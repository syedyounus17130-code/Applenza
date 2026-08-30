document.getElementById("bookingForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.currentTarget;
  const button = form.querySelector("button[type='submit']");
  const message = document.getElementById("formMessage");
  const data = Object.fromEntries(new FormData(form).entries());

  button.disabled = true;
  button.textContent = "Sending...";
  message.textContent = "";

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Something went wrong.");

    message.textContent = `Request received! Your reference is ${result.leadId}. We'll contact you shortly.`;
    form.reset();
  } catch (error) {
    message.textContent = "We couldn't submit your request. Please call us directly.";
    console.error(error);
  } finally {
    button.disabled = false;
    button.textContent = "Request a Service";
  }
});
