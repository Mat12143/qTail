import { allowedExtensions } from '$lib/const';
import {
	createTask,
	getAllCompletedTasks,
	getAllWaitingTasks,
	isIstanceNew,
	setTaskStatus
} from '$lib/db';
import { uploadFile } from '$lib/file';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (isIstanceNew()) throw redirect(303, '/setup');
	const waiting = await getAllWaitingTasks();
	const completed = await getAllCompletedTasks();

	return {
		completed: completed,
		waiting: waiting,
		admin: locals.admin
	};
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();

		const author = data.get('author');
		const note = data.get('note');
		const file = data.get('file');
		const title = data.get('title');

		if (!author || !file || file?.name == undefined || !title) {
			return fail(400, {
				error: true,
				message: 'Controlla di aver inserito tutti i dati'
			});
		}
		if (author.toString().length > 21 || title.toString().lenght > 21)
			return fail(400, {
				error: true,
				message: 'Nome o titolo troppo lungo'
			});

		const fileExtension = file.name.split('.')[file.name.split('.').length - 1];

		if (!allowedExtensions.includes(fileExtension))
			return fail(400, {
				error: true,
				message: 'File non supportato'
			});

		const fileUploadResp = await uploadFile(file, author);
		if (fileUploadResp.error || fileUploadResp.name == null)
			return fail(400, {
				error: true,
				message: 'Errore nel caricamento del file. Riprovare'
			});

		await createTask(author, fileUploadResp.name, note, title);

		return {
			error: false,
			message: 'Stampa aggiunta'
		};
	},
	printed: async ({ locals, request }) => {
		if (!locals.admin)
			return {
				error: true,
				message: 'Non hai i permessi necessari'
			};

		const formData = await request.formData();
		const taskID = formData.get('taskID');

		if (!setTaskStatus(taskID, 1))
			return {
				error: true
			};
		return { error: false, message: 'Stampa stampata' };
	},
	reject: async ({ locals, request }) => {
		if (!locals.admin)
			return {
				error: true,
				message: 'Non hai i permessi necessari'
			};

		const formData = await request.formData();
		const taskID = formData.get('taskID');

		if (!setTaskStatus(taskID, 2))
			return {
				error: true
			};
		return { error: false, message: 'Stampa rifiutata' };
	}
};
