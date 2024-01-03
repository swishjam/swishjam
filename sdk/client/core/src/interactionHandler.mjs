export class InteractionHandler {
  constructor({
    recordClicks = true,
    recordFormSubmits = true,
    clickElementTypes = ['A', 'BUTTON'],
  }) {
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
            clickedId: e.target.id,
            clickedClass: e.target.className,
            clickedText: e.target.innerText,
          }
        })
      ));
    });
  }

  _initFormListeners = () => {
    if (!this.recordFormSubmits) return;
    document.addEventListener('submit', e => {
      this.onInteractionCallbacks.forEach(callback => (
        callback({
          type: 'form_submit',
          attributes: {
            form_id: e.target.id,
            form_class: e.target.className,
            form_method: e.target.method,
            form_action: e.target.action,
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
}

export default InteractionHandler;