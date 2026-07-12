import { Router } from 'express';
import { libraryController } from './library.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import { createBookSchema, updateBookSchema, issueBookSchema, returnBookSchema, collectFineSchema, bookListQuerySchema, issueListQuerySchema } from './library.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['library:view']);
const manage = requirePermission(['library:create']);
const edit = requirePermission(['library:edit']);

// Books
router.get('/books', view, validateRequest({ query: bookListQuerySchema }), libraryController.listBooks);
router.get('/books/:id', view, libraryController.getBook);
router.get('/books/barcode/:barcode', view, libraryController.findByBarcode);
router.post('/books', manage, validate(createBookSchema), libraryController.createBook);
router.patch('/books/:id', edit, validate(updateBookSchema), libraryController.updateBook);
router.delete('/books/:id', edit, libraryController.deleteBook);

// Issue & Return
router.get('/issues', view, validateRequest({ query: issueListQuerySchema }), libraryController.listIssues);
router.post('/issues', manage, validate(issueBookSchema), libraryController.issueBook);
router.post('/returns', manage, validate(returnBookSchema), libraryController.returnBook);
router.post('/fines', manage, validate(collectFineSchema), libraryController.collectFine);

// Reports
router.get('/reports/inventory', view, libraryController.getInventory);
router.get('/reports/overdue', view, libraryController.getOverdue);
router.get('/reports/most-issued', view, libraryController.getMostIssued);

export { router as libraryRouter };
