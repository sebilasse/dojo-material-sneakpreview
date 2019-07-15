import { v, w } from '@dojo/framework/widget-core/d';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import { TabProperties } from '../Tabs';

import TextInput from '../../widgets/text-input';
import Listbox from '../../widgets/listbox';
import Combobox from '../../widgets/combobox';
import Select from '../../widgets/select';
import * as css from '../../styles/tabs.m.css';
import * as uiCss from '../../widgets/themes/redaktor-default/_ui.m.css';

import Image from '../../widgets/image';
import Card from '../../widgets/card';
import Chip from '../../widgets/chip';

export default class SelectTab<P extends TabProperties = TabProperties> extends WidgetBase<P> {

	private _animals = [
		{
			value: 'cat',
			label: 'Cat'
		},
		{
			value: 'dog',
			label: 'Dog'
		},
		{
			value: 'mouse',
			label: 'Mouse'
		},
		{
			value: 'hamster',
			label: 'Hamster'
		},
		{
			value: 'sheep',
			label: 'Sheep'
		},
		{
			value: 'bird',
			label: 'Bird'
		},
		{
			value: 'cow',
			label: 'Cow'
		},
		{
			value: 'racoon dog',
			label: 'Racoon dog'
		},
		{
			value: 'horse',
			label: 'Horse'
		},
		{
			value: 'goat',
			label: 'Goat',
			disabled: true
		}
	];

	render() {
		const { size = 'default' } = this.properties;

		return v('div', { classes: css.root }, [

			w(Image, {
				src: 'https://placehold.it/320x160/fff',
     		srcset:
`https://placehold.it/8x4/ddd 1w,
https://placehold.it/320x160/ddd 320w,
https://placehold.it/480x240/ccc 480w,
https://placehold.it/768x384/444/fff 768w,
https://placehold.it/1024x512/a20000/fff 1024w,
https://placehold.it/1280x640/fd8700/000 1280w`,
				alt: 'a lighthouse',
				styles: { width: '50%', height: 'auto' }
			}),

			w(Card, { size }, []),
			//w(Chip, { size, schema: 'primary' }, [ 'Primary' ]),

			v('br'),

			w(Combobox, {
				size,
				responsive: false,
				blurOnSelect: false,
				name: 'testcombo1',
				autocomplete: false,
				schema: 'primary',
				//animated: false,
				//muted: true,
				//filled: true,
				//outlined: true,
				label: 'A primary Combobox',
				placeholder: 'optional placeholder',
				//helperText: 'Lorem Ipsum - helperText'
				scroll: false,
				widgetId: 'combo1',
				//helperText: 'Lorem Ipsum - helperText',
				//schema: 'primary',
				//raised: true,
				results: this._animals,//.map((o) => o.label),
				getOptionText: (o: any, i: number) => o.label,
				//getOptionLabel: (o: any, i: number, textNode: any) => textNode
				//tabIndex: _open ? 0 : -1,

				onResultSelect: (v: any, i: number, key: string) => console.log('!!! onResultSelect', v, i, key),
				onChange: (v: any, i: number, key: string) => { console.log('!!! onChange', v, i, key) }
			}),

			w(Combobox, {
				size,
				responsive: false,
				blurOnSelect: false,
				name: 'testcombo2',
				autocomplete: false,
				strict: true,
				label: 'A Combobox, strict',
				placeholder: 'optional placeholder',
				scroll: false,
				widgetId: 'combo2',
				results: this._animals,//.map((o) => o.label),
				getOptionText: (o: any, i: number) => o.label,
				onResultSelect: (v: any, i: number, key: string) => console.log('!!! onResultSelect', v, i, key),
				onChange: (v: any, i: number, key: string) => { console.log('!!! onChange', v, i, key) }
			}),

			v('br'),

			w(Select, {
				size,
				label: 'Single Select no scroll no schema',
				scroll: false,
				activeIndex: 0,
				widgetId: 'sel1',
				options: this._animals.map((o) => o.label),
				//tabIndex: _open ? 0 : -1,
				helperText: 'lorem'
			}),

			v('br'),

			w(Select, {
				size,
				label: 'Single Select no scroll secondary',
				scroll: false,
				schema: 'secondary',
				activeIndex: 0,
				widgetId: 'sel2',
				options: this._animals.map((o) => o.label),
				helperText: 'lorem'
			}),

			v('br'),

			w(Select, {
				size,
				label: 'Single Select scroll',
				scroll: true,
				activeIndex: 2,
				widgetId: 'sel3',
				options: this._animals.map((o) => o.label),
				helperText: 'lorem'
			}),

			w(Select, {
				size,
				label: 'Multi Select no scroll primary',
				multiple: true,
				scroll: false,
				schema: 'primary',
				activeIndex: 2, /* TODO INDICES ! */
				widgetId: 'sel4',
				options: this._animals.map((o) => o.label),
				helperText: 'lorem'
			}),

			v('br'),

			w(Select, {
				size,
				scroll: true,
				label: 'Multi Select scroll',
				activeIndex: 2, /* TODO INDICES ! */
				widgetId: 'sel5',
				multiple: true,
				required: true,
				options: this._animals.map((o) => o.label),
				helperText: 'lorem'
			}),

			v('br'),

			w(Listbox, {
				size,
				scroll: false,
				label: 'Listbox multiple, no scroll expanded',
				activeIndex: 2,
				widgetId: 'lb1',
				autoOpen: false,
				multiple: true,
				optionData: this._animals.map((o) => o.label),
				//tabIndex: _open ? 0 : -1,
				helperText: 'lorem'
			}),

			v('p',['X']),

			w(Listbox, {
				size,
				scroll: true,
				label: 'Listbox scroll expanded',
				activeIndex: 2,
				widgetId: 'lb2',
				autoOpen: false,
				//schema: 'primary',
				//raised: true,
				optionData: this._animals.map((o) => o.label),
				//tabIndex: _open ? 0 : -1,
				helperText: 'lorem'
			}),

			v('p',['X']),

			w(Listbox, {
				size,
				scroll: true,
				label: 'Multi Select scroll expanded',
				activeIndex: 2,
				widgetId: 'lb3',
				schema: 'primary',
				multiple: true,
				autoOpen: false,
				optionData: this._animals.map((o) => o.label),
				//tabIndex: _open ? 0 : -1,
				helperText: 'lorem'
			}),

			v('br'),

			w(Select, {
				size,
				label: 'this should open to top',
				scroll: false,
				activeIndex: 0,
				widgetId: 'sel6',
				options: this._animals.map((o) => o.label),
				//tabIndex: _open ? 0 : -1,
				helperText: 'lorem'
			})

		]);
	}
}
