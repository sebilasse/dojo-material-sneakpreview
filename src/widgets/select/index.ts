import {
  DNode, v, w, RedaktorWidgetBase, RedaktorProperties, theme, customElement
} from '../common/Widget';
import { Input } from '../common/interfaces';
import { formatAriaProperties, keyName } from '../common/util';
import { diffProperty } from '@dojo/framework/widget-core/decorators/diffProperty';
import { reference } from '@dojo/framework/widget-core/diff';
import Focus from '@dojo/framework/widget-core/meta/Focus';
import uuid from '../../framework/uuid';
import { find } from '@dojo/framework/shim/array';

import TextInputBase, { TextInputProperties as TIP } from '../baseInput';
import Button from '../button/index';
import Listbox from '../listbox/index';
import Icon from '../icon/index';
import * as css from '../themes/redaktor-default/select.m.css';


import Label from '../label/index';

/**
 * @type SelectProperties
 *
 * Properties that can be set on a Select component
 *
 * @property getOptionDisabled Function that accepts an option's data and index and returns a boolean
 * @property getOptionId       Function that accepts an option's data and index and returns a string id
 * @property getOptionLabel    Function that accepts an option's data and index and returns a DNode label
 * @property getOptionSelected Function that accepts an option's data and index and returns a boolean
 * @property getOptionValue    Function that accepts an option's data and index and returns a string value
 * @property options           Array of any type of data for the options
 * @property placeholder       Optional placeholder text, only valid for custom select widgets (useNativeElement must be false or undefined)
 * @property useNativeElement  Use the native <select> element if true
 * @property value           The current value
 */
export interface SelectProperties extends TIP {
	getOptionDisabled?(option: any, index: number): boolean;
	getOptionId?(option: any, index: number): string;
	getOptionLabel?(option: any): DNode;
	getOptionSelected?(option: any, index: number): boolean;
	getOptionValue?(option: any, index: number): string;
	options?: any[];
	placeholder?: string;
	useNativeElement?: boolean;

	onFocus?(evt: FocusEvent): void;
	onBlur?(evt: FocusEvent): void;
	onChange?(evt: Input): void;
  /*FIXME EVENT:
	onBlur?(key?: string | number): void;
	onChange?(option: any, key?: string | number): void;
	onFocus?(key?: string | number): void;
  */
	value?: string;
}

@theme(css)
@diffProperty('options', reference)
@customElement<SelectProperties>({
	tag: 'redaktor-select',
	properties: [
		'theme', 'aria', 'extraClasses', 'options', 'useNativeElement',
		'getOptionDisabled', 'getOptionId', 'getOptionLabel', 'getOptionSelected',
		'getOptionValue', 'readOnly', 'required', 'invalid', 'disabled',
		'labelAfter', 'labelHidden'
	],
	attributes: [ 'widgetId', 'placeholder', 'label', 'value' ],
	events: [ 'onBlur', 'onChange', 'onFocus' ]
})
export default class SelectBase<P extends SelectProperties = SelectProperties>
extends RedaktorWidgetBase<P> {
	private _callListboxFocus = false;
	private _focusedIndex = 0;
	private _ignoreBlur = false;
	private _open = false;
	private _baseId = uuid();

	private _getOptionLabel(option: any) {
		const { getOptionLabel } = this.properties;
		const fallback = option ? `${option}` : '';
		return getOptionLabel ? getOptionLabel(option) : fallback;
	}

	private _getOptionSelected = (option: any, index: number) => {
		const { getOptionValue, value } = this.properties;
		return getOptionValue ? getOptionValue(option, index) === value : option === value;
	}
/*
	protected _onBlur (event: FocusEvent) {
    this.properties.onBlur && this.properties.onBlur(this.properties.key || '');
  }
	protected _onFocus (event: FocusEvent) {
    this.properties.onFocus && this.properties.onFocus(this.properties.key || '');
  }
*/
	// native select events
	private _onNativeChange (event: Event) {
		const { key, getOptionValue, options = [], onChange } = this.properties;
		event.stopPropagation();
		const value = (<HTMLInputElement> event.target).value;
		const option = find(options, (option: any, index: number) => getOptionValue ? getOptionValue(option, index) === value : false);
    // FIXME EVENT:
    this.readonlyProp('key', key, event);
    this.readonlyProp('option', option, event);
    this.readonlyProp('value', value, event);
		option && onChange && onChange(<Input>event);
	}

	// custom select events
	private _openSelect() {
		this._callListboxFocus = true;
		this._ignoreBlur = true;
		this._open = true;
		this._focusedIndex = this._focusedIndex || 0;
		this.invalidate();
	}

	private _closeSelect() {
		this._ignoreBlur = true;
		this._open = false;
		this.invalidate();
	}

	private _onDropdownKeyDown(event: KeyboardEvent) {
		event.stopPropagation();
		if (keyName(event, 'Escape')) {
			this.meta(Focus).set('trigger');
			this._closeSelect();
		}
	}

	private _onTriggerClick(event: MouseEvent) {
    console.log(event)
		event.stopPropagation();
		this._open ? this._closeSelect() : this._openSelect();
	}

	private _onTriggerBlur(event: FocusEvent) {
		if (this._ignoreBlur) {
			this._ignoreBlur = false;
			return;
		}
		const { key, onBlur } = this.properties;
    // FIXME EVENT:
    this.readonlyProp('key', key, event);
		onBlur && onBlur(event);
		this._closeSelect();
	}

	private _onTriggerKeyDown(event: KeyboardEvent) {
		event.stopPropagation();
    if (keyName(event, 'ArrowDown')) {
			this._openSelect();
		}
	}

	private _onTriggerMouseDown() {
		this._ignoreBlur = true;
	}

	private _onListboxBlur(event: FocusEvent) {
		if (this._ignoreBlur) {
			this._ignoreBlur = false;
			return;
		}

		const { key, onBlur } = this.properties;
    // FIXME EVENT:
    this.readonlyProp('key', key, event);
		onBlur && onBlur(event);
		this._closeSelect();
	}

	protected getRootClasses() {
		const {
			disabled,
			invalid,
			readOnly,
			required
		} = this.properties;
		const focus = this.meta(Focus).get('root');

		return [
			css.root,
			disabled ? css.disabled : null,
			focus.containsFocus ? css.focused : null,
			invalid === true ? css.invalid : null,
			invalid === false ? css.valid : null,
			readOnly ? css.readonly : null,
			required ? css.required : null
		];
	}

	protected renderExpandIcon(): DNode {
		const { theme } = this.properties;
		return v('span', { classes: this.theme(css.arrow) }, [
			w(Icon, { type: 'downIcon', theme })
		]);
	}

	protected renderNativeSelect(): DNode {
		const {
			aria = {},
			disabled,
			getOptionDisabled,
			getOptionId,
			getOptionSelected,
			getOptionValue,
			widgetId = this._baseId,
			invalid,
			name,
			options = [],
			readOnly,
			required,
			value
		} = this.properties;

		/* create option nodes */
		const optionNodes = options.map((option, i) => v('option', {
			value: getOptionValue ? getOptionValue(option, i) : '',
			id: getOptionId ? getOptionId(option, i) : undefined,
			disabled: getOptionDisabled ? getOptionDisabled(option, i) : undefined,
			selected: getOptionSelected ? getOptionSelected(option, i) : undefined
		}, [ this._getOptionLabel(option) ]));

		return v('div', { classes: this.theme(css.inputWrapper) }, [
			v('select', {
				...formatAriaProperties(aria),
				classes: this.theme(css.input),
				disabled,
				'aria-invalid': invalid ? 'true' : null,
				id: widgetId,
				name,
				readOnly,
				'aria-readonly': readOnly ? 'true' : null,
				required,
				value,
				//FIXME EVENT: onblur: this._onBlur,
				onchange: this._onNativeChange,
				//FIXME EVENT: onfocus: this._onFocus
			}, optionNodes),
			this.renderExpandIcon()
		]);
	}

	protected renderCustomSelect(): DNode {
		const {
			getOptionDisabled,
			getOptionId,
			getOptionLabel,
			getOptionSelected = this._getOptionSelected,
			widgetId = this._baseId,
			key,
			options = [],
			theme,
			onChange
		} = this.properties;

		const {
			_open,
			_focusedIndex
		} = this;

		const focusListbox = this._callListboxFocus;

		if (this._callListboxFocus) {
			this._callListboxFocus = false;
		}

		// create dropdown trigger and select box
		return v('div', {
			key: 'wrapper',
			classes: this.theme([ css.inputWrapper, _open ? css.open : null ])
		}, [
			...this.renderCustomTrigger(),
			v('div', {
				classes: this.theme(css.dropdown),
				onfocusout: this._onListboxBlur,
				onkeydown: this._onDropdownKeyDown
			}, [
				w(Listbox, {
					key: 'listbox',
					activeIndex: _focusedIndex,
					widgetId: widgetId,
					focus: focusListbox,
					optionData: options,
					tabIndex: _open ? 0 : -1,
					getOptionDisabled,
					getOptionId,
					getOptionLabel,
					getOptionSelected,
					theme,
					onActiveIndexChange: (index: number) => {
						this._focusedIndex = index;
						this.invalidate();
					},
					onOptionSelect: (option: any) => {

            // FIXME EVENT:
            this.readonlyProp('key', key, event);
            this.readonlyProp('option', option, event);
            this.readonlyProp('value', option.value, event);

						onChange && onChange(<Input>event);
						this.meta(Focus).set('trigger');
						this._closeSelect();
					}
				})
			])
		]);
	}

	protected renderCustomTrigger(): DNode[] {
		const {
			aria = {}, options = [], getOptionSelected = this._getOptionSelected,
      size, disabled, invalid, placeholder, readOnly, required, value
		} = this.properties;

		let label: DNode;
		let isPlaceholder = false;
		const selectedOption = find(options, (option: any, index: number) => {
			return getOptionSelected(option, index);
		});
		if (selectedOption) {
			label = this._getOptionLabel(selectedOption);
		} else {
			isPlaceholder = true;
			label = placeholder ? placeholder : this._getOptionLabel(options[0]);
		}

		return [
      w(Button, {
        key: 'trigger',
        size, //responsive: true,
        popup: { id: this._baseId, expanded: this._open, type: 'listbox' },
        ...formatAriaProperties(aria),
        //'aria-invalid': invalid ? 'true' : null,
        //'aria-required': required ? 'true' : null,
        value,
        disabled: disabled || readOnly,
        onBlur: this._onTriggerBlur,
        onClick: this._onTriggerClick,
        //FIXME EVENT: onFocus: this._onFocus,
        onKeyDown: this._onTriggerKeyDown,
        onMouseDown: this._onTriggerMouseDown
      }, [ label ]),
			this.renderExpandIcon()
		];
	}
  /* WAS
  v('button', {
    ...formatAriaProperties(aria),
    'aria-controls': this._baseId,
    'aria-expanded': `${this._open}`,
    'aria-haspopup': 'listbox',
    'aria-invalid': invalid ? 'true' : null,
    'aria-required': required ? 'true' : null,
    classes: this.theme([ css.trigger, isPlaceholder ? css.placeholder : null ]),
    //disabled: disabled || readOnly,
    key: 'trigger',
    type: 'button',
    value,
    onblur: this._onTriggerBlur,
    onclick: this._onTriggerClick,
    onfocus: this._onFocus,
    onkeydown: this._onTriggerKeyDown,
    onmousedown: this._onTriggerMouseDown
  }, [ label ]),*/

	protected render(): DNode {
		const {
      widgetId = this._baseId, useNativeElement = false,
			label, labelHidden, labelAfter, disabled, invalid, readOnly, required, theme
		} = this.properties;
		const focus = this.meta(Focus).get('root');

		const children = [
			label ? w(Label, {
				muted: true,
				theme,
				disabled,
				focused: focus.containsFocus,
				invalid,
				readOnly,
				required,
				hidden: labelHidden,
				forId: widgetId
			}, [ label ]) : null,
			useNativeElement ? this.renderNativeSelect() : this.renderCustomSelect()
		];

		return v('div', {
			key: 'root',
			classes: this.theme(this.getRootClasses())
		}, labelAfter ? children.reverse() : children);
	}
}

export class Select extends SelectBase<SelectProperties> {}
