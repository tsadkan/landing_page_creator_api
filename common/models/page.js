module.exports = function(Page) {
    Page.createPage = async (accessToken, pageId, sectionList, title, description)=> {
        if (!accessToken || !accessToken.userId) {
            throw Error("Unauthorized User", 403);
        }

        const { Section, Row, Column, Element } = Page.app.models;
        const { userId } = accessToken;

        const page = await Page.create({
            title,
            description,
            userId
        });

        sectionList.forEach(async s => {
            const section = await Section.create({
                index: s.index,
                pageId: page.id
            });

            s.rows.forEach(async r => {
                const row = await Row.create({
                    index: r.index,
                    sectionId: section.id
                });

                r.columns.forEach(async c => {
                    const column = await Column.create({
                        index: c.index,
                        columnWidth: c.columnWidth,
                        rowId: row.id
                    });

                    const element = await Element.create({
                        type: c.element.type,
                        element: c.element.element,
                        columnId: column.id
                    });
                });
            });
        });

        // await Promise.all(
        //     sectionList.map(async section => {
        //         const section = await section.create({
        //             index: section.index,
        //             pageId: page.id
        //         });

        //         section.rows.map
        //     })
        // )
        console.log(sectionList, title, description);

        return { status: true };
    };
    
    Page.remoteMethod("createPage", {
        description: "create or update a page.",
        accepts: [
            {
                arg: "accessToken",
                type: "object",
                http: ctx => {
                    const req = ctx && ctx.req;
                    const accessToken = req && req.accessToken ? req.accessToken : null;
                    return accessToken;
                }
            },
            { arg: "pageId", type: "string" },
            { arg: "sectionList", type: "array", required:true },
            { arg: "title", type: "string", required:true },
            { arg: "description", type: "string" }
        ],
        returns: { type: "object", root: true },
        http: { path: "/create-page", verb: "post" }
    });
};
