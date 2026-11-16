const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    const status = document.querySelector('#form-status');
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {method:'POST', body:new FormData(form), headers:{Accept:'application/json'}, signal:controller.signal});
      if (!response.ok) throw new Error('Submission failed');
      try { window.BenAnalytics?.track('generate_lead'); } catch {}
      form.reset();
      status.textContent = 'Thanks — your message has been sent. I’ll get back to you by email.';
      status.focus();
    } catch (error) {
      status.textContent = error.name === 'AbortError'
        ? 'We couldn’t confirm whether your message arrived. Please email benjaminyoung8@gmail.com if you don’t hear back.'
        : 'Your message couldn’t be sent. Please try again or email benjaminyoung8@gmail.com. Your details are still here.';
      status.focus();
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.innerHTML = 'Send to Ben <span class="arrow" aria-hidden="true">↗</span>';
    }
  });
}

const clock = document.querySelector('#melbourne-time');
if (clock) {
  const updateClock = () => { clock.textContent = new Intl.DateTimeFormat('en-AU', {timeZone:'Australia/Melbourne',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()); };
  updateClock();
  setInterval(updateClock, 60000);
}
