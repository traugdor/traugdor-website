import { assembleAddress, mailtoHref } from '../lib/email';

const button = document.querySelector<HTMLButtonElement>('[data-reveal-email]');
const target = document.querySelector<HTMLElement>('[data-email-target]');

if (button && target) {
  button.hidden = false;
  button.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = mailtoHref();
    link.textContent = assembleAddress();
    target.replaceChildren(link);
    button.hidden = true;
  });
}
