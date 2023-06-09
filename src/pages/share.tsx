import ShareForm from '@/components/view/ShareForm';
import { ServiceApi } from '@/services';
import { socket } from '@/services/socket';
import { ProfileSelectors } from '@/store';
import { isSuccess } from '@/utils';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { message } from 'antd';
import { useRouter } from 'next/router';

export default function SharePage() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const profile = useSelector(ProfileSelectors.selectProfile);

	const onFinish = async (values: { videoUrl: string }) => {
		setLoading(true);

		try {
			if (!isYouTubeLink(values.videoUrl)) {
				message.error('Invalid YouTube link');
			} else {
				const metadata = await getMetadataLink(values.videoUrl);

				const res = await ServiceApi.createSharing({
					videoUrl: values.videoUrl,
					title: metadata?.title,
					description: metadata?.description,
					cover: metadata?.images?.[0],
				});
				if (isSuccess(res)) {
					socket.emit(
						'chat message',
						JSON.stringify({ ...res?.data, email: profile.email })
					);
					message.success('Share movie successful');
					router.replace('/');
				}
			}
		} catch (e) {
			message.error('Invalid URL');
		} finally {
			setLoading(false);
		}
	};

	const isYouTubeLink = (url: string) => {
		// Regex pattern để kiểm tra định dạng liên kết YouTube
		var youtubePattern =
			/^(http(s)?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;

		// Kiểm tra xem URL có phù hợp với pattern hay không
		return youtubePattern.test(url);
	};

	const getMetadataLink = async (link: string) => {
		try {
			const response = await fetch(`/api/get-preview-link?link=${link}`);

			const result = await response.json();

			return result;
		} catch (e) {
			return {};
		}
	};

	return (
		<div className="center fixed inset-0 ">
			<ShareForm loading={loading} onFinish={onFinish} />
		</div>
	);
}
