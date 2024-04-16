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
      if (!this._shouldRecordClick(e)) return;
      this.onInteractionCallbacks.forEach(callback => (
        callback({
          type: 'click',
          attributes: {
            clicked_id: e.target.id,
            clicked_class: e.target.className,
            clicked_text: e.target.innerText,
          }
        })
      ));
    });
  }

  _initFormListeners = () => {
    debugger
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

  _shouldRecordClick = event => {
    const { target } = event;
    const { tagName } = target;
    if (this.clickElementTypes.includes(tagName)) {
      return true;
    } else if (tagName === 'INPUT') {
      const { type: inputType } = target;
      return ['submit', 'button'].includes(inputType)
    } else {
      return false;
    }
  }

  _maybeAutoIdentifyFormSubmit = submitEvent => {
    if (!this.autoIdentify) return;
    const emailInputs = submitEvent.target.querySelectorAll('input[type="email"]');
    const emailValues = Array.from(emailInputs).map(input => input.value);
    const uniqueEmailValues = [...new Set(emailValues)];
    // pretty basic way of making sure it's a legit email
    if (uniqueEmailValues.length === 1 && uniqueEmailValues[0].length > 3) {
      this.onInteractionCallbacks.forEach(callback => (
        callback({ type: 'setUser', attributes: { email: emailValues[0], auto_identified: true } })
      ));
    }
  }
}

export default InteractionHandler;