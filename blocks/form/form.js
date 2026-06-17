const WEB3FORMS_ACCESS_KEY = 'd1fcb73a-c065-439e-a3ac-efa8fea41db8';
const SUCCESS_MESSAGE = "Thanks for submitting the form. You'll be hearing from us soon!";

let formId = 0;

function setFormStatus(statusEl, message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.hidden = !message;
  statusEl.classList.toggle('form-status-error', isError);
  statusEl.classList.toggle('form-status-success', !isError && !!message);
}

function hasSelectedInterest(form) {
  return form.querySelectorAll('.form-interests input[type="checkbox"]:checked').length > 0;
}

function showSuccessState(wrapper) {
  wrapper.querySelector('.form-web3')?.remove();
  wrapper.querySelector('.form-status')?.remove();

  const success = document.createElement('p');
  success.classList.add('form-success-message');
  success.textContent = SUCCESS_MESSAGE;
  wrapper.append(success);

  wrapper.closest('.form')?.classList.add('form-submitted');
}

function buildSubmissionPayload(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.access_key = WEB3FORMS_ACCESS_KEY;

  payload.interests = [...form.querySelectorAll('.form-interests input[type="checkbox"]:checked')]
    .map((input) => input.value)
    .join(', ');

  return payload;
}

async function submitToWeb3Forms(payload) {
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    throw new Error('Unable to read the server response. Please try again.');
  }

  if (response.status !== 200 || data.success === false) {
    throw new Error(data.message || data.body?.message || 'Something went wrong. Please try again.');
  }

  return data;
}

function bindFormSubmit(form, wrapper, statusEl) {
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFormStatus(statusEl, '');

    if (!form.reportValidity()) {
      return;
    }

    if (!hasSelectedInterest(form)) {
      setFormStatus(statusEl, 'Please complete this required field.', true);
      return;
    }

    const originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.disabled = true;

    try {
      await submitToWeb3Forms(buildSubmissionPayload(form));
      showSuccessState(wrapper);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setFormStatus(statusEl, message, true);
    } finally {
      if (form.isConnected) {
        submitBtn.innerHTML = originalHtml;
        submitBtn.disabled = false;
      }
    }
  });
}

function createRequiredMark() {
  const mark = document.createElement('span');
  mark.classList.add('form-required');
  mark.textContent = '*';
  mark.setAttribute('aria-hidden', 'true');
  return mark;
}

function createTextInput(id, name, options = {}) {
  const input = document.createElement('input');
  input.type = options.type || 'text';
  input.name = name;
  input.id = id;
  input.autocomplete = options.autocomplete || 'off';
  if (options.required) {
    input.required = true;
  }
  return input;
}

function createField(id, labelText, input, { required = false } = {}) {
  const field = document.createElement('div');
  field.classList.add('form-field');

  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.append(document.createTextNode(labelText));
  if (required) {
    label.append(createRequiredMark());
  }

  field.append(label, input);
  return field;
}

function createCheckboxField(name, labelText, value) {
  const id = `${name}-${value.replace(/\s+/g, '-').toLowerCase()}`;
  const label = document.createElement('label');
  label.classList.add('form-checkbox');
  label.setAttribute('for', id);

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.name = name;
  input.id = id;
  input.value = value;

  const text = document.createElement('span');
  text.textContent = labelText;

  label.append(input, text);
  return label;
}

function createInterestsFieldset(formIdPrefix) {
  const fieldset = document.createElement('fieldset');
  fieldset.classList.add('form-interests');

  const legend = document.createElement('legend');
  legend.append(document.createTextNode('I am interested in:'));
  legend.append(createRequiredMark());

  fieldset.append(
    legend,
    createCheckboxField(`${formIdPrefix}-interest`, 'Investor News', 'Investor News'),
    createCheckboxField(`${formIdPrefix}-interest`, 'Stagwell Updates', 'Stagwell Updates'),
  );

  return fieldset;
}

function buildForm() {
  formId += 1;
  const form = document.createElement('form');
  form.classList.add('form-web3');
  form.id = `web3form-${formId}`;
  form.setAttribute('action', 'https://api.web3forms.com/submit');
  form.setAttribute('method', 'POST');
  form.noValidate = true;

  const accessKey = document.createElement('input');
  accessKey.type = 'hidden';
  accessKey.name = 'access_key';
  accessKey.value = WEB3FORMS_ACCESS_KEY;

  const subject = document.createElement('input');
  subject.type = 'hidden';
  subject.name = 'subject';
  subject.value = 'Stagwell Newsletter Sign Up';

  const firstNameInput = createTextInput(`${form.id}-firstname`, 'firstname', {
    autocomplete: 'given-name',
  });
  const lastNameInput = createTextInput(`${form.id}-lastname`, 'lastname', {
    autocomplete: 'family-name',
  });
  const emailInput = createTextInput(`${form.id}-email`, 'email', {
    type: 'email',
    autocomplete: 'email',
    required: true,
  });

  const nameRow = document.createElement('div');
  nameRow.classList.add('form-row', 'form-row-split');
  nameRow.append(
    createField(firstNameInput.id, 'First name', firstNameInput),
    createField(lastNameInput.id, 'Last name', lastNameInput),
  );

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.classList.add('form-submit');
  submitBtn.innerHTML = '<span>Submit</span><span class="form-submit-arrow" aria-hidden="true">→</span>';

  form.append(
    accessKey,
    subject,
    nameRow,
    createField(emailInput.id, 'Email', emailInput, { required: true }),
    createInterestsFieldset(form.id),
    submitBtn,
  );

  return form;
}

export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('form-inner');

  const form = buildForm();
  const status = document.createElement('p');
  status.classList.add('form-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.hidden = true;

  wrapper.append(form, status);
  block.replaceChildren(wrapper);
  bindFormSubmit(form, wrapper, status);
}
