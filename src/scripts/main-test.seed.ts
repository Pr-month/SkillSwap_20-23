import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Repository } from 'typeorm';
import { seedCategories } from './categories.seed';
import { seedUsersTest } from './users-test.seed';
import { seedAdmin } from './users-admin.seed';
import { seedSkillsTest } from './skills-test.seed';

export async function seedForTests(
  userRepo: Repository<User>,
  skillRepo: Repository<Skill>,
  categoryRepo: Repository<Category>,
) {
  await seedCategories(categoryRepo);
  await seedAdmin(userRepo);
  await seedUsersTest(userRepo);
  await seedSkillsTest(userRepo, skillRepo, categoryRepo);
}
