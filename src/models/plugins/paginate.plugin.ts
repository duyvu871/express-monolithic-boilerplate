import { Model, Schema, Document } from "mongoose";

interface PaginateOptions {
    page?: string;
    limit?: string;
    sortBy?: string;
    populate?: string;
}

export interface PaginateResult<T extends Document> {
    results: T[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

const paginate = (schema: any) => {
    /**
     * @example
     * userSchema.plugin(paginate);
     *
     * @param query - query to paginate
     * @param options - options for pagination
     * @param options.page - page number
     * @param options.limit - number of items per page
     */
    schema.statics.paginate = async function (query: Record<string, string>, options: PaginateOptions): Promise<PaginateResult<Document>> {
        let sort = '';
        // check if the options has a sortBy field
        if (options.sortBy) {
           /* EXAMPLE: options.sortBy = 'field1:asc,field2:desc' */
           // split the sortBy field by comma
           const sortingCriteria: string[] = [];
           // loop through the sortBy field
           options.sortBy.split(',').forEach((sortOption: string) => {
               // split the sortOption by colon
               const [key, order] = sortOption.split(':');
               // push the sorting criteria to the sortingCriteria array
               sortingCriteria.push((order === 'desc' ? '-' : '') + key);
           });
           sort = sortingCriteria.join(' ');
        } else {
           sort = 'createdAt';
        }

        // get the limit and page from the options
        const limit: number = options.limit && parseInt(options.limit, 10) || 10;
        const page: number = options.page && parseInt(options.page, 10) || 1;
        const skip = (page - 1) * limit;

        const promiseCount = this.countDocuments(query).exec();
        let docsPromise = this.find(query).sort(sort).skip(skip).limit(limit).exec();

        // check if the options has a populate field
        if (options.populate) {
            // split the populate field by comma
            options.populate.split(',').forEach((populateOption: string) => {
                // populate the field
                docsPromise = docsPromise.populate(
                    populateOption
                        .split('.')
                        .reverse()
                        // @ts-ignore
                        .reduce((a, b) => ({path: b, populate: a}))
                );
            });
        }

        docsPromise = docsPromise.exec();

        return Promise.all([promiseCount, docsPromise]).then((values) => {
            const [totalResults, results] = values;
            const totalPages = Math.ceil(totalResults / limit);
            const result = {
                results,
                page,
                limit,
                totalPages,
                totalResults,
            };
            return Promise.resolve(result);
        });
    };
};

export default paginate;