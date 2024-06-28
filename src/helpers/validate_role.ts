import { roles } from '@/configs/roles';
import { z } from 'zod';

export const validateRole = (role: string) => {
	const roleZod = z.enum([roles[0], ...roles.slice(1)]);
	const parseRole = roleZod.parse(role);
	if (parseRole) {
		return true;
	}
}