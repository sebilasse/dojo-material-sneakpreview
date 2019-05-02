import { v, w } from '@dojo/framework/widget-core/d';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import { Input } from '../../widgets/common/interfaces';
import Icon from '../../widgets/icon';
import TimePicker, { TimeUnits } from '../../widgets/time-picker';
import TextInput from '../../widgets/text-input';
import ComboBox from '../../widgets/combobox';
import { TabProperties } from '../Tabs';
import * as css from '../../styles/tabs.m.css';

export default class TextInputTab<P extends TabProperties = TabProperties> extends WidgetBase<P> {
	private _timePickerOptions: TimeUnits[];
	private _timePickerValue = '10:30';

	private _textValue = 'Initial Value';

	private _onSetValue(evt: Input) {
		this._timePickerValue = evt.value;
		this.invalidate();
	}

	render() {
		const { size = 'default' } = this.properties;
    const responsive = true;
		return v('div', { classes: css.root }, [
			v('h3', [ 'Text input' ]),
			v('div', [
				w(TextInput, {
					size,
          responsive,
					//schema: 'orange',
					label: 'Text input',
					placeholder: 'Enter text'
				}),
				w(TextInput, {
					size,
          responsive,
					label: 'Required text input',
					required: true,
					placeholder: 'Hello'
				}),
				w(TextInput, {
					size,
          responsive,
					label: 'With value',
					value: this._textValue,/*
					onChange: (evt: Input) => {
						this._textValue = evt.value.replace('n','x');
						this.invalidate()
					},*/
					placeholder: 'enter text'
				}),

				w(TextInput, {
					size,
          responsive,
					label: 'Primary text input',
					schema: 'primary',
					placeholder: 'Enter Primary text'
				}),
				w(TextInput, {
					size,
          responsive,
					label: 'Secondary text input',
					schema: 'secondary',
					placeholder: 'Enter Secondary text'
				}),
				w(TextInput, {
					size,
          //responsive,
					label: 'password input (primary)',
					schema: 'primary',
					type: 'password',
					placeholder: 'Password'
				}),
				w(TextInput, {
					size,
          responsive,
					label: 'email input',
					type: 'email',
					placeholder: 'Email address'
				}),
				w(TextInput, {
					size,
          responsive,
					label: 'required text input (primary)',
					schema: 'primary',
					required: true,
					placeholder: 'enter required text'
				}),
        v('br'),

				w(TextInput, {
					size,
          responsive,
					type: 'text',
					label: 'Disabled input',
					value: 'Initial value',
					disabled: true,
					readOnly: true
				}),
				w(TextInput, {
					size,
          responsive,
					schema: 'primary',
					placeholder: 'primary - has no label'
				}),
				w(TextInput, {
					size,
          responsive,
					placeholder: 'no label'
				})
			]),
			v('h3', [ 'Text input with addons' ]),
			v('div', [
				w(TextInput, {
					size,
          responsive,
					schema: 'primary',
					addonBefore: [ '@' ],
					label: 'Primary Twitter Username',
					placeholder: 'username'
				}),
        v('br'),
				w(TextInput, {
					size,
          responsive,
					addonBefore: [ '@' ],
					label: 'Twitter Username',
					placeholder: 'username'
				}),
				w(TextInput, {
					size,
          responsive: false,
					addonBefore: [ '$' ],
					addonAfter: [ '.00' ],
					label: 'Price, rounded to the nearest dollar',
					type: 'number'
				}),
				w(TextInput, {
					size,
          responsive: false,
					addonAfter: [ w(Icon, {type: 'downIcon'}) ],
					label: 'Test'
				}),
				w(TextInput, {
					size,
          responsive,
					schema: 'primary',
					addonBefore: [ w(Icon, { type: 'closeIcon' }) ],
					addonAfter: [ w(Icon, {type: 'downIcon'}) ],
					label: 'Test'
				}),
/*
				w(ComboBox, {
					label: 'ComboBox',
					clearable: true,
					results: ['Initial value', '2nd value']
				}),
				w(ComboBox, {
					label: 'Primary ComboBox',
					clearable: true,
					schema: 'primary',
					value: 'Initial Value',
					results: ['Initial value', '2nd value', 'in 2nd', 'freaky']
				})
*/
			]),
/*
			v('h3', [ 'Time picker' ]),
			v('div', [
				w(TimePicker, {
					clearable: true,
					end: '23:59',
					label: 'Basic time picker',
					//onChange: this._onSetValue,
					options: this._timePickerOptions,
					start: '00:00',
					step: 1800,
					value: this._timePickerValue
				}),
				w(TimePicker, {
					clearable: true,
					end: '23:59',
					label: 'Basic time picker (native)',
					onChange: this._onSetValue,
					options: this._timePickerOptions,
					start: '00:00',
					step: 1800,
					value: this._timePickerValue,
					useNativeElement: true
				}),
				w(TimePicker, {
					clearable: true,
					disabled: true,
					end: '23:59',
					label: 'Disabled time picker',
					onChange: this._onSetValue,
					options: this._timePickerOptions,
					start: '00:00',
					step: 1800,
					value: this._timePickerValue
				}),
				w(TimePicker, {
					clearable: true,
					disabled: true,
					end: '23:59',
					label: 'Disabled time picker (native)',
					onChange: this._onSetValue,
					options: this._timePickerOptions,
					start: '00:00',
					step: 1800,
					value: this._timePickerValue,
					useNativeElement: true
				})
			])
		*/
		]);
	}
}
