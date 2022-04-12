const productModel = require('../model/productModel')
const validate = require('../validator/validators')

const getProduct = async (req, res) => {
    try {
        const filterQuery = { isDeleted: false, deletedAt: null };
        const filter = req.query;

        if (validate.isValidRequestBody(filter)) {
            const { name, size, priceSort, priceGreaterThan, priceLessThan } = filter;

            if (Object.keys(filter).includes('name')) {
                filterQuery.name = { $regex: `.*${name.trim()}.*` };
            }
            if (Object.keys(filter).includes('priceSort')) {
                if (priceSort == "ascending") priceSort = 1;
                if (priceSort == "decending") priceSort = -1;
                else {
                    return res.status(400).send({ status: false, message: "Please give ascending or decending price sort" })
                }
            }

            if (Object.keys(filter).includes('size')) {
                //size valid to be completed
                filterQuery.size = { $all: size }
            }

            if (Object.keys(filter).includes('priceGreaterThan')) {
                //num validation
                filterQuery.price = { $gte: priceGreaterThan };
            }

            if (Object.keys(filter).includes('priceLessThan')) {
                filterQuery.price = { $lte: priceLessThan };
            }
            if (Object.keys(filter).includes('priceLessThan' && 'priceGreaterThan')) {
                filterQuery.price = { $gte: priceGreaterThan, $lte: priceLessThan };
            }
        }

        const product = await productModel.find(filterQuery).sort({ price: priceSort });
        if (product.length == 0) {
            return res.status(400).send({ status: false, msg: "no product found" });
        }

        res.status(201).send({ status: true, data: product });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

