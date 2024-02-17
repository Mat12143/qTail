import { writeFileSync } from 'fs';

export const generateUnique = (author: string, fileExt: string) => {
	console.log(Date.now().toString());
	return `${author.replaceAll(' ', '_')}_${Date.now().toString()}.${fileExt}`;
};

export const uploadFile = async (file: File, author: string) => {
	const fileName = generateUnique(author, file.name.split('.', 2)[1]);

	try {
		writeFileSync(`static/files/${fileName}`, Buffer.from(await file.arrayBuffer()));
	} catch (err) {
		console.log(err);
		return { error: true, name: null };
	}

	return { error: false, name: fileName };
};
