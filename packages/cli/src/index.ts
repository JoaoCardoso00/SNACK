import { Command } from 'commander'
import { create } from './commands/create'
import { init } from './commands/init'
import { add } from './commands/add'

const program = new Command()

program
	.name('snack')
	.description('CLI tool for SNACK CMS')
	.version('0.0.1')

program
	.command('create')
	.description('Create a new SNACK project')
	.argument('[name]', 'Project name')
	.action(create)

program
	.command('init')
	.description('Initialize SNACK in an existing project')
	.action(init)

program
	.command('add')
	.description('Add features to your SNACK project')
	.argument('<feature>', 'Feature to add (studio)')
	.action(add)

program.parse()
