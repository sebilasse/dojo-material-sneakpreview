import {
	CustomAriaProperties, InputProperties as _InputP, LabeledProperties,
	PointerEventProperties, KeyEventProperties, InputEventProperties, Input
} from './common/interfaces';
import {
  DNode, v, w, RedaktorCSS, RedaktorWidgetBase, RedaktorProperties, theme, customElement
} from './common/Widget';
import keyboard from './common/events/keyboard';
import { formatAriaProperties } from './common/util';
import has from '@dojo/framework/has/has';
import uuid from '../framework/uuid';
import Focus from '@dojo/framework/widget-core/meta/Focus';
import MetaBase from '@dojo/framework/widget-core/meta/Base';
import Label from './label/index';
import * as css from './themes/redaktor-default/text-input.m.css';
import * as fixedCss from './text-input/styles/text-input.m.css';

interface HasInput {
	documentMode: number,
	beforeInput: boolean,
	fallbackCompositionData: boolean,
	compositionEvent: boolean,
	textInputEvent: boolean,
	beforeInputEmitted: boolean
}

interface Level2Input {
	inputType: string,
	data: string | null,
	dataTransfer: DataTransfer | null,
	isComposing: boolean,
	getTargetRanges: () => any[],
	range: number[],
	type: string
}
// TODO https://github.com/Microsoft/TypeScript/issues/17592 (please upvote)
export enum TextInputPatternType {
	'text' = 'text',
	'email' = 'email',
	'search' = 'search',
	'tel' = 'tel',
	'url' = 'url'
}
export enum TextInputType {
	'text' = 'text',
	'hidden' = 'hidden',
	'email' = 'email',
	'number' = 'number',
	'password' = 'password',
	'search' = 'search',
	'tel' = 'tel',
	'url' = 'url'
}
// do NOT allow example@example -
// https://codepen.io/kevinSuttle/post/the-current-state-of-web-forms
export const emailRegexStr = [
	"[a-zA-Z0-9_]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)",
	"*@(?!([a-zA-Z0-9]*\\.[a-zA-Z0-9]*\.[a-zA-Z0-9]*\\.))",
	"(?:[A-Za-z0-9](?:[a-zA-Z0-9-]*[A-Za-z0-9])?\\.)",
	"+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?"
].join('');

export interface InputProperties extends RedaktorProperties,
_InputP, InputEventProperties, LabeledProperties, PointerEventProperties,
KeyEventProperties, CustomAriaProperties {
	addonBefore?: DNode[];
	addonAfter?: DNode[];
	value?: number | string;
	shouldFocus?: boolean;
}
/**
 * @type TextInputProperties
 *
 * Properties that can be set on a TextInput component
 *
 * @property controls       ID of an element that this input controls
 * @property type           Input type, e.g. text, email, tel, etc.
 * @property maxLength      Maximum number of characters allowed in the input
 * @property minLength      Minimum number of characters allowed in the input
 * @property placeholder    Placeholder text
 * @property value          The current value
 */
export interface TextInputProperties extends InputProperties {
	controls?: string;
	type?: TextInputType | keyof typeof TextInputType;
	pattern?: string | RegExp;
	maxLength?: number | string;
	minLength?: number | string;
	placeholder?: string;
	box?: boolean;
}
/* TODO check readonly + size
---  hidden
-> the special value _charset_ causes the hidden input's value to be reported as the
character encoding used to submit the form
name
--- email
Whether or not to allow multiple, comma-separated, e-mail addresses to be entered
multiple
???
The id of a <datalist> element located in the same document which provides a list
of predefined values to suggest to the user for this input.
list


A string that describes what if any type of autocomplete functionality the input should provide
Possible values https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
autocomplete

A Boolean attribute which, if present, indicates that the input should automatically have focus
autofocus

A string specifying the <form> element with which the input is associated (that is, its form owner).
form

An optional numeric value that defines both whether or not the input should be focusable through use
of the Tab key as well as whether or not the element participates in sequential focus navigation.
tabindex

Defines whether the element may be checked for spelling errors.
spellcheck


------
+ SubmitInput
image: A graphical submit button.
You must use the src attribute to define the source of the image and the alt attribute
to define alternative text.
You can use the height and width attributes to define the size of the image in pixels.
--- submit
The URL to which to submit the form's data; overrides the form's action attribute,
if any.
formaction
A string specifying the encoding type to use for the form data.
formenctype
The HTTP method (get or post) to use when submitting the form.
formmethod
A Boolean which, if present, means the form's fields will not be subjected to
constraint validation before submitting the data to the server
formnovalidate
The browsing context into which to load the response returned by the server after
submitting the form
formtarget

+ FileInput
file: A control that lets the user select a file.
--- file
One or more unique file type specifiers describing file types to allow
accept
What source to use for capturing image or video data
capture
A FileList listing the chosen files
files
A Boolean which, if present, indicates that the user may choose more than one file
multiple

+ DateInput
A control for entering a date (year, month, and day, with no time).
--- date / time
min
max
step

+ NumberInput
--- number / range
min
max
step

+ ColorInput
color: A control for specifying a color.
*/

export default class TextInputBase<P extends TextInputProperties = TextInputProperties>
extends RedaktorWidgetBase<P> {

	protected _uuid: string;
	protected _defaultValue = '';
	protected _box = false;
	protected _fixedLabel = false;
	protected _inputElement = 'input';
	protected _hasRange = true;
	/* Input Events Level 2 Polyfill, e.g. for beforeInput
	Trying to catch cancelable events as early as possible
	*/
	/*
	TODO deleteCompositionText deleteByComposition // per ctxMenu deleteContent
	TODO getTargetRanges()
	returns , unless the inputType is "historyUndo" or "historyRedo" or the editing host
	is not a contenteditable element, in which case it returns an empty Array.
	TODO .data
	data holds the value of the characters generated by an input method.
	This MAY be a single Unicode character or a non-empty sequence of Unicode characters.
	Characters SHOULD be normalized as defined by the Unicode normalization form NFC, defined in [UAX15].
	This attribute MAY contain the empty string.
	*/
	protected has: HasInput = {
		documentMode: 0,
		beforeInput: false,
		fallbackCompositionData: false,
		compositionEvent: false,
		textInputEvent: false,
		beforeInputEmitted: false
	};
	protected level2: Level2Input = {
		type: 'beforeinput',
		inputType: '',
		data: null,
		dataTransfer: null,
		isComposing: false,
		getTargetRanges: () => [],
		range: [0,0]
	};

	set inputType(type: string) { this.level2.inputType = type; }
	set data(data: string) {  this.level2.data = data; }
	set dataTransfer(event: ClipboardEvent) {
		this.level2.dataTransfer = event.clipboardData ||
			(<any>event).dataTransfer || {};
	}
	set range(event: any) {
		if (!!event.target && typeof event.target.selectionStart === 'number') {
			this.level2.range = [
				event.target.selectionStart, event.target.selectionEnd
			];
		}
	}
	get hasRange() {
		return this.level2.range[0] !== this.level2.range[1];
	}
	get isComposing() { return this.level2.isComposing }
	set isComposing(isC: boolean) { this.level2.isComposing = isC }

	constructor() {
		super();
		this._uuid = uuid();
	}
	onAttach() {
		if (has('host-browser')) {
			const docMode = 'documentMode' in document ? (<any>document).documentMode : 0;
			this.has.documentMode = docMode;
			this.has.compositionEvent = 'CompositionEvent' in window;
		 	this.has.textInputEvent = 'TextEvent' in window && !docMode;
		  this.has.fallbackCompositionData = (!this.has.compositionEvent ||
		    (docMode && docMode > 8 && docMode <= 11));
			this.has.beforeInput = 'onbeforeinput' in document ||
				(('InputEvent' in window) && 'inputType' in (new (<any>window).InputEvent('')));
		}
  }

	// TODO _onMouseUp (event: MouseEvent) { HAD this.range = event;

	protected _onFocus(event: FocusEvent) {
		this.properties.onFocus && this.properties.onFocus(event);
	}
	protected _onBlur(event: FocusEvent) {
		this.properties.onBlur && this.properties.onBlur(event);
	}
	protected _onMouseDown(event: MouseEvent) {
		event.stopPropagation();
		this.properties.onMouseDown && this.properties.onMouseDown(event);
	}
	protected _onClick(event: MouseEvent) {
		event.stopPropagation();
		this.properties.onClick && this.properties.onClick(event);
	}
	protected _onMouseUp(event: MouseEvent) {
		if (this._hasRange) { this.range = event }
		event.stopPropagation();
		this.properties.onMouseUp && this.properties.onMouseUp(event);
	}
	protected _onTouchStart(event: TouchEvent) {
		event.stopPropagation();
		this.properties.onTouchStart && this.properties.onTouchStart(event);
	}
	protected _onTouchEnd(event: TouchEvent) {
		event.stopPropagation();
		this.properties.onTouchEnd && this.properties.onTouchEnd(event);
	}
	protected _onTouchCancel(event: TouchEvent) {
		event.stopPropagation();
		this.properties.onTouchCancel && this.properties.onTouchCancel(event);
	}

	protected _onKeyDown(event: KeyboardEvent) {
		event.stopPropagation();
		const evt = keyboard(event);
		if (!this.has.beforeInput) {
			if (evt.key === 'Backspace') {
				this.inputType = this.hasRange ? 'deleteContent' :
					(evt.altKey === true ? 'deleteWordBackward' : 'deleteContentBackward');
				this._onBeforeInput(evt);
			} else if (evt.key === 'Delete') {
				this.inputType = this.hasRange ? 'deleteContent' :
					(evt.altKey === true ? 'deleteWordForward' : 'deleteContentForward');
				this._onBeforeInput(evt);
			}
		}
		// TODO contextmenu delete https://github.com/mozilla/notes/issues/423
		this.properties.onKeyDown && this.properties.onKeyDown(evt, () => { event.preventDefault(); });
	}
	protected _onKeyPress(event: KeyboardEvent) {
		event.stopPropagation();
		const evt = keyboard(event);
		if (evt.key.length > 1) {
			return (this.properties.onKeyPress && this.properties.onKeyPress(evt, () => { evt.preventDefault(); }));
		}
		const vOld = <string>this._value||'';
		const v = (<HTMLInputElement>evt.target).value;
		const isTranspose = (v.length === vOld.length && `${v[1]}${v[0]}${v.slice(2)}` === vOld);
		this.inputType = isTranspose ? 'insertTranspose' : 'insertText';
		this.data = evt.key; // TODO ???
		if (!this.has.textInputEvent && !this.has.compositionEvent) {
			this.isComposing = evt.isStart;
		}
		!this.has.beforeInput && this._onBeforeInput(evt);
		this.properties.onKeyPress && this.properties.onKeyPress(evt, () => { evt.preventDefault(); });
	}
	protected _onKeyUp(event: KeyboardEvent) {
		event.stopPropagation();
		if (this._hasRange) { this.range = event }
		const evt = keyboard(event);
		this.properties.onKeyUp && this.properties.onKeyUp(evt, () => { evt.preventDefault(); });
	}

	protected _onComposition(event: UIEvent, type = 'insertCompositionText') {
		this.inputType = type; // TODO beforeInput
		this.isComposing = (type === 'insertCompositionText');
		!this.has.beforeInput && this._onBeforeInput(event);
	}
	protected _onCompositionStart(event: UIEvent) {
		this._onComposition(event);
	}
	protected _onCompositionEnd(event: UIEvent) {
		// TODO if range deleteByComposition
		this._onComposition(event, 'insertFromComposition');
	}

	protected _onCut(event: ClipboardEvent) {
		this.dataTransfer = event;
		this.inputType = 'clipboardData' in event && event.clipboardData.dropEffect === 'move' ?
			'deleteByDrag' : 'deleteByCut';
		!this.has.beforeInput && this._onBeforeInput(event);
	}
	protected _onPaste(event: ClipboardEvent) {
		this.dataTransfer = event;
		// TODO if level2.range SHOULD WE emit deleteContent ?
		this.inputType = 'clipboardData' in event && event.clipboardData.dropEffect === 'move' ?
			'insertFromDrop' : 'insertFromPaste';
		!this.has.beforeInput && this._onBeforeInput(event);
	}
	protected _onDrop(event: ClipboardEvent) {
		// TODO if level2.range SHOULD WE emit deleteContent ?
		if (this._hasRange) { this.range = event }
		this.dataTransfer = event;
		this.inputType = 'insertFromDrop';
		!this.has.beforeInput && this._onBeforeInput(event);
	}
	protected _onDragEnd(event: ClipboardEvent) {
		// NOTE browser normalization:
		// Drag to another field means 'Cut' in e.g Safari and 'Copy' in e.g. Firefox
		// TODO if range deleteByDrag
		if (this._hasRange) { this.range = event }
		// TODO check if value changed: deleteByDrag

	}

	protected getCaretRange(el: HTMLInputElement | any) {
		var doc = el.ownerDocument || el.document;
		var win = doc.defaultView || doc.parentWindow;
		if (el.selectionStart && el.selectionEnd) {
			return [el.selectionStart, el.selectionEnd]
		} else if (typeof win.getSelection !== "undefined" && win.getSelection().rangeCount > 0) {
			var range = win.getSelection().getRangeAt(0);
			return [range.startOffset, range.endOffset];
		}
		return [0,0]
	}
	protected _onBeforeInput(event: any) {
		//event.stopPropagation();
		if (!this.has.beforeInput && this.level2.inputType !== '') {
	  	('InputEvent' in window) && (<any>Object).setPrototypeOf(event, (<any>window).InputEvent.prototype);
	    ['type', 'inputType', 'data', 'dataTransfer', 'getTargetRanges'].forEach((key) =>
	    	!(key in event) && this.readonlyProp(key, (<any>this.level2)[key], event))
		}
		//this._value = this._evt('onBeforeInput', event);
		this.readonlyProp('value', this._value, event);
		this.properties.onBeforeInput && this.properties.onBeforeInput(<Input>event);
	}
	protected _onInput(event: Input) {
		event.stopPropagation();
		if (!!this.isComposing) {
			if (!this.has.compositionEvent) {
				this.isComposing = false;
			}
			return
		}
// TODO autofill / spellchecker ? "insertReplacementText"

		this._value = (<HTMLInputElement>event.target).value;
		this.readonlyProp('value', this._value, event);
		this.properties.onInput && this.properties.onInput(event);
	}
	protected _onChange(event: Input) {
		event.stopPropagation();
		this.readonlyProp('value', this._value, event);
//console.log('_onChange', (<HTMLInputElement>event.target).value, this._value, this.properties.onChange);
		this.properties.onChange && this.properties.onChange(event);
	}

	protected _getRootClasses(ui: RedaktorCSS = css): (string | null)[] {
		const { responsive, required, label, labelStatic } = this.properties;
		const focus = this.meta(Focus).get('root');
		return [
			ui.root,
			this.getDisabledClass(ui),
			this.getValidClass(ui),
			focus.containsFocus ? ui.focused : null,
			responsive ? ui.responsive : null,
			required ? ui.required : null,
			label && (labelStatic) ? ui.staticLabel : (label ? ui.slideLabel : ui.noLabel)
		];
	}
	protected getRootClasses(): (string | null)[] { return this._getRootClasses() }
	protected getInputClasses(): (string | null)[] { return [css.input] }
	protected getWrapperClasses(): (string | null)[] { return [css.wrapper] }
	protected getFixedRootClasses(): (string | null)[] { return [] }
	protected getFixedInputClasses(): (string | null)[] { return [ fixedCss.input ] }





	protected getInputProperties(): any {
		const {type = 'text'} = this.properties;
		let { pattern } = this.properties;
		if (pattern instanceof RegExp) { pattern = pattern.source; }
		if (!(type in TextInputPatternType)) {
			pattern = void 0;
		} else if (type === 'email' && typeof pattern !== 'string') {
			pattern = emailRegexStr;
		}
		return {type, pattern}
	}

	get _inputValue(): string {
		const { value = this._defaultValue } = this.properties;
		if (typeof this._value === 'undefined') { return `${value}` }
		return (<string>this._value);
	}
	protected renderInput(): DNode {
		const {
			widgetId = this._uuid, aria = {},
			disabled, invalid, maxLength, minLength, name, placeholder,
			readOnly, required, shouldFocus
		} = this.properties;
		if (shouldFocus) { this.meta(Focus).set('input') }

		this._value = this._inputValue;
//console.log('render',this._value);
		return v(this._inputElement, {
			id: widgetId,
			key: 'input',
			...formatAriaProperties(aria),
			'aria-invalid': invalid ? 'true' : null,
			classes: [...this.theme(this.getInputClasses()), ...this.getFixedInputClasses()],
			disabled,
			maxlength: maxLength ? `${maxLength}` : null,
			minlength: minLength ? `${minLength}` : null,
			name,
			placeholder: placeholder ? placeholder : ' ', /* CSS :placeholder-shown */
			readOnly,
			'aria-readonly': readOnly ? 'true' : null,
			required,
			value: this._value,
			onfocus: this._onFocus,
			onblur: this._onBlur,

			onbeforeinput: (this.has.beforeInput ?
				this._onBeforeInput : null),
			oninput: this._onInput,
			ontextinput: (this.has.textInputEvent && !('oninput' in window) ?
				this._onInput : null),

			oncut: this._onCut,
			onpaste: this._onPaste,
			ondragend: this._onDragEnd,
			ondrop: this._onDrop,
			onkeydown: this._onKeyDown,
			oncompositionstart: (this.has.compositionEvent ?
				this._onCompositionStart : null),
			onkeypress: this._onKeyPress,
			oncompositionend: (this.has.compositionEvent ?
				this._onCompositionEnd : null),
			onkeyup: this._onKeyUp,
			onchange: this._onChange,
			onclick: this._onClick,
			onmousedown: this._onMouseDown,
			onmouseup: this._onMouseUp,
			ontouchstart: this._onTouchStart,
			ontouchend: this._onTouchEnd,
			ontouchcancel: this._onTouchCancel,
			...this.getInputProperties(),
		});
	}

	protected renderLabel(_size = true) {
		if (!this.properties.label) { return null }
		const {
			widgetId = this._uuid, size,
			disabled, invalid, label, labelAfter = false, labelHidden = false,
			readOnly, required, schema, theme
		} = this.properties;
		const focus = this.meta(Focus).get('root');
		return w(Label, {
			muted: true,
			theme,
			schema,
			size: _size ? size : undefined,
			disabled,
			invalid,
			readOnly,
			required,
			focused: focus.containsFocus,
			hidden: labelHidden,
			forId: widgetId
		}, [ label ])
	}
	protected renderAddon(addon: DNode, before = false): DNode {
		return v('div', {
			classes: [
				before ? fixedCss.prefix : fixedCss.suffix,
				before ? css.prefix : css.suffix,
				css.square,
				...this.getSizeClasses()
			]
		}, [ addon ]);
	}
	protected renderMenu(): DNode { return null }
	protected renderInputWrapper(): DNode {
		const { label, labelStatic, addonAfter = [], addonBefore = [] } = this.properties;
		const _input = this.renderInput();
		const _prefixes = addonBefore.map((addon: DNode) => this.renderAddon(addon, true));
		const _suffixes = addonAfter.map((addon: DNode) => this.renderAddon(addon));
		const addonsInput = !this._box && label && !labelStatic ?
			[_input, ..._prefixes, ..._suffixes] : [..._prefixes, _input, ..._suffixes];
		return v('div', {
			key: 'wrapper',
			classes: [
				...this.getSchemaClasses(css),
				...this.getSizeClasses(),
				...this.theme(this.getWrapperClasses())
			]
		}, [
			...addonsInput,
			this._box ? null : v('b', {classes: this.theme(css.border)}),
			this._box ? null : this.renderLabel(),
			this.renderMenu()
		]);
	}

	protected render(): DNode {
		const { labelAfter, schema, box = false } = this.properties;
		this._box = box;
		const children = [
			(this._box || this._fixedLabel) ? this.renderLabel() : null,
			this.renderInputWrapper()
		];
		return v('div',
			{
				key: 'root',
				classes: [
					this.getSizeClasses()[0],
					...this.getSchemaClasses(css, true),
					...this.getFixedRootClasses(),
					...this.theme(this.getRootClasses())]
			},
			(labelAfter ? children.reverse() : children).concat(this.children.filter(child => child !== null))
		);
	}
}