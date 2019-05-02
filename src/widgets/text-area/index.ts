import { DNode, v, theme, customElement } from '../common/Widget';
import { Input } from '../../widgets/common/interfaces';
import Label from '../label/index';
import Dimensions from '@dojo/framework/widget-core/meta/Dimensions';

import TextInputBase, { TextInputProperties } from '../baseInput';
import * as css from '../themes/redaktor-default/text-area.m.css';

export class ExpandHeight extends Dimensions {
	set(key: string, isResize = false): any {
	  const node = this.getNode(key);
		if (node) {
			const _lh = window.getComputedStyle(node).lineHeight;
			const lh = _lh && parseInt(_lh.replace('px', ''), 10) || 0;
			!isResize && node.setAttribute('style', '');
			const { scroll, offset } = this.get(key);
			if (isResize) {
				const h = lh && Math.floor(Math.ceil(scroll.height / lh) * lh);
				h && node.setAttribute('style', `height:${h}px;`);
				return scroll.height;
			} else if (scroll.height > offset.height) {
				console.log(scroll.width);
				node.setAttribute('style', `height:${Math.ceil(scroll.height)}px;`);
				return scroll.height;
			}
		}
	}
}
/**
 * @type TextareaProperties
 *
 * Properties that can be set on a Textarea component
 *
 * @property columns         Number of columns, controls the width of the textarea
 * @property rows            Number of rows, controls the height of the textarea
 * @property wrapText        Controls text wrapping. Can be "hard", "soft", or "off"
 * @property maxLength      Maximum number of characters allowed in the input
 * @property minLength      Minimum number of characters allowed in the input
 * @property placeholder    Placeholder text
 * @property value           The current value
 */
export interface TextareaProperties extends TextInputProperties {
	columns?: number;
	rows?: number;
	wrapText?: 'hard' | 'soft' | 'off';
	maxLength?: number | string;
	minLength?: number | string;
	expand?: boolean;
}

@theme(css)
@customElement<TextareaProperties>({
	tag: 'redaktor-text-area',
	attributes: [
		'widgetId', 'label', 'placeholder', 'minLength', 'maxLength', 'value', 'name'
	],
	properties: [
		'aria', 'disabled', 'invalid', 'required', 'readOnly', 'labelHidden',
		'columns', 'rows', 'expand', 'size', 'theme', 'schema', 'extraClasses'
	],
	events: [
		'onBlur', 'onChange', 'onClick', 'onFocus', 'onInput', 'onMouseDown', 'onMouseUp',
		'onKeyDown', 'onKeyPress', 'onKeyUp', 'onTouchCancel', 'onTouchEnd', 'onTouchStart'
	]
})

export class TextareaBase<P extends TextareaProperties = TextareaProperties>
extends TextInputBase<TextareaProperties> {
	protected _inputElement = 'textarea';
	private _height: number;

	constructor() {
		super();
	}

	protected _onInput (event: Input) {
		event.stopPropagation();
		this._value = (event.target as HTMLInputElement).value;
		if (this.properties.expand) {
			this._height = this.meta(ExpandHeight).set('input');
		}
		this.readonlyProp('value', this._value, event);
		this.properties.onInput && this.properties.onInput(event);
	}
	protected _onMouseUp (event: MouseEvent) {
		event.stopPropagation();
		const { expand } = this.properties;
		if (!expand) {
			const _h = this.meta(ExpandHeight).get('input').offset.height;
			if (_h !== this._height) {
				this._height = !this._height ? _h : this.meta(ExpandHeight).set('input', true);
			}
		}
		this.properties.onMouseUp && this.properties.onMouseUp(event);
	}

	protected getRootClasses(): any {
		const { expand } = this.properties;
		return [
			...this._getRootClasses(css),
			this.theme(expand ? css.expand : css.fixed)
		]
	}
	protected getInputClasses() { return [css.input] }
	protected getInputProperties() {
		const { expand, columns, wrapText } = this.properties;
		let { rows = 1 } = this.properties;
		if (!expand) { rows = Math.max(rows, 3) }
		return {
			style: expand ? '' : `height: 48px;`,
			wrap: wrapText,
			cols: columns ? `${columns}` : null,
			rows: rows ? `${rows}` : null
		}
	}
	protected renderInputWrapper() {
		return v('div', {
			key: 'wrapper',
			classes: [
				...this.getSchemaClasses(css),
				...this.getSizeClasses(),
				this.theme(css.wrapper)
			]
		}, [
			this.renderInput(),
			this._box ? null : v('b', {classes: this.theme(css.border)}),
			this._box ? null : this.renderLabel()
		]);
	}
}

export default class Textarea extends TextareaBase<TextareaProperties> {}
