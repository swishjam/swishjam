export class InteractionHandler {
  constructor({
    autoIdentify = true,
    clickElementTypes = ['A', 'BUTTON'],
    recordClicks = true,
    recordFormSubmits = true,
  }) {
    this.autoIdentify = autoIdentify;
    this.recordClicks = recordClicks;
    this.recordFormSubmits = recordFormSubmits;
    this.clickElementTypes = clickElementTypes.map(type => type.toUpperCase());
    this.onInteractionCallbacks = [];
    this._initClickListeners();
    this._initFormListeners();
  }

  onInteraction = callback => {
    this.onInteractionCallbacks.push(callback);
  }

  _initClickListeners = () => {
    if (!this.recordClicks) return;
    document.addEventListener('click', e => {
      const target = this._targetToAttributeClickTo(e.target);
      if (!target) return;
      const { id, className, tagName, href } = target;
      let clickedText = target.innerText;
      if (clickedText.length > 100) {
        clickedText = `${clickedText.slice(0, 100)}...`;
      }
      let attributes = { clicked_id: id, clicked_class: className, clicked_text: clickedText, clicked_element: tagName };
      if (href) attributes.clicked_href = href;
      this.onInteractionCallbacks.forEach(callback => callback({ type: 'click', attributes }));
    });
  }

  _initFormListeners = () => {
    if (!this.recordFormSubmits) return;
    document.addEventListener('submit', e => {
      this._maybeAutoIdentifyFormSubmit(e);
      this.onInteractionCallbacks.forEach(callback => (
        callback({
          type: 'form_submit',
          attributes: {
            form_id: e.target.id,
            form_class: e.target.className,
            form_method: e.target.method,
            form_action: e.target.action,
            form_name: e.target.name,
          }
        })
      ));
    });
  }

  _targetToAttributeClickTo = (target, numIterations = 1) => {
    if (!target || numIterations >= 10) return;
    const { tagName } = target;
    if (this.clickElementTypes.includes(tagName)) {
      return target;
    } else if (tagName === 'INPUT' && this.clickElementTypes.includes('BUTTON')) {
      const { type: inputType } = target;
      if (['submit', 'button'].includes(inputType)) {
        return target;
      }
    } else {
      return this._targetToAttributeClickTo(target.parentNode, numIterations + 1);
    }
  }

  _maybeAutoIdentifyFormSubmit = submitEvent => {
    if (!this.autoIdentify) return;
    const emailInputs = submitEvent.target.querySelectorAll('input[type="email"]');
    const emailValues = Array.from(emailInputs).map(input => input.value);
    const uniqueEmailValues = [...new Set(emailValues)];
    if (uniqueEmailValues.length !== 1) return;
    const maybeEmail = uniqueEmailValues[0];
    const isEmail = maybeEmail.includes('@') && maybeEmail.includes('.') && maybeEmail.length > 5;
    if (!isEmail) return;
    this.onInteractionCallbacks.forEach(callback => (
      callback({ type: 'setUser', attributes: { email: maybeEmail, auto_identified: true } })
    ));
  }
}

export default InteractionHandler;