/* eslint-disable react-hooks/rules-of-hooks */
import { useComposedRef, useWindowResizeListener } from '@/hooks';
import { onEnterKeyCondition } from '@/utils';
import * as React from 'react';

import calculateNodeHeight from './calculateNodeHeight';
import getSizingData, { SizingData } from './getSizingData';
import { noop } from './utils';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Style = Omit<
	NonNullable<TextareaProps['style']>,
	'maxHeight' | 'minHeight'
> & {
	height?: number;
};

export type TextareaHeightChangeMeta = {
	rowHeight: number;
};
export interface TextareaAutosizeProps extends Omit<TextareaProps, 'style'> {
	maxRows?: number;
	minRows?: number;
	onHeightChange?: (height: number, meta: TextareaHeightChangeMeta) => void;
	cacheMeasurements?: boolean;
	style?: Style;
	onEnter?: () => void;
}

const TextareaAutosize: React.ForwardRefRenderFunction<
	HTMLTextAreaElement,
	TextareaAutosizeProps
> = (
	{
		onEnter,
		cacheMeasurements,
		maxRows,
		minRows,
		onChange = noop,
		onHeightChange = noop,
		...props
	},
	userRef: React.Ref<HTMLTextAreaElement>
) => {
	if (process.env.NODE_ENV !== 'production' && props.style) {
		if ('maxHeight' in props.style) {
			throw new Error(
				'Using `style.maxHeight` for <TextareaAutosize/> is not supported. Please use `maxRows`.'
			);
		}
		if ('minHeight' in props.style) {
			throw new Error(
				'Using `style.minHeight` for <TextareaAutosize/> is not supported. Please use `minRows`.'
			);
		}
	}
	const isControlled = props.value !== undefined;
	const libRef = React.useRef<HTMLTextAreaElement | null>(null);
	const ref = useComposedRef(libRef, userRef);
	const heightRef = React.useRef(0);
	const measurementsCacheRef = React.useRef<SizingData>();

	const resizeTextarea = () => {
		const node = libRef.current!;
		const nodeSizingData =
			cacheMeasurements && measurementsCacheRef.current
				? measurementsCacheRef.current
				: getSizingData(node);

		if (!nodeSizingData) {
			return;
		}

		measurementsCacheRef.current = nodeSizingData;

		const [height, rowHeight] = calculateNodeHeight(
			nodeSizingData,
			node.value || node.placeholder || 'x',
			minRows,
			maxRows
		);

		if (heightRef.current !== height) {
			heightRef.current = height;
			node.style.setProperty('height', `${height}px`);
			onHeightChange(height, { rowHeight });
		}
	};

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (!isControlled) {
			resizeTextarea();
		}
		onChange(event);
	};

	if (typeof document !== 'undefined') {
		React.useLayoutEffect(resizeTextarea);
		useWindowResizeListener(resizeTextarea);
	}

	const onKeyPress = React.useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			onEnterKeyCondition(e, onEnter);
		},
		[onEnter]
	);

	return (
		<textarea
			{...props}
			onChange={handleChange}
			onKeyPress={onKeyPress}
			ref={ref}
		/>
	);
};

export default React.forwardRef(TextareaAutosize);
