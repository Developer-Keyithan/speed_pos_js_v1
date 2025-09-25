angularApp.controller("AddProductController", [
    "$scope",
    "API_URL",
    "window",
    "jQuery",
    "$compile",
    "$uibModal",
    "$http",
    "$sce",
    "categoryAddModal", "categoryEditModal", "categoryDeleteModal", "ProductAddModal", "ProductEditModal", "ProductDetailsModel",
    function ($scope, API_URL, window, $, $compile, $uibModal, $http, $sce, categoryAddModal, categoryEditModal, categoryDeleteModal, ProductAddModal, ProductEditModal, ProductDetailsModel) {
        // 🔹 Open Add Product modal
        $scope.openAddProductModal = function (category, catPath, material) {
            // console.log(material)
            if (!category || !catPath || !material) return;

            let categoryName = category.c_name;
            let categoryId = category.id;

            $http.get(window.baseUrl + "/_inc/_product.php", {
                params: { action_type: "GET_NEW_REF_NO" }
            }).then(function (res) {
                let newProductCode = res.data.newProductCode;
                ProductAddModal($scope, { categoryPath: catPath, categoryName, productCode: newProductCode, id: categoryId, material });
            });
        };

        // 🔹 Initialize DataTable for root categories
        var dt = $("#categoryTable");
        dt.DataTable({
            processing: true,
            responsive: false,
            paging: false,
            searching: false,
            ordering: false,
            info: false,
            ajax: {
                url: "../_inc/_category.php",
                type: "GET",
                data: { action_type: "GET_CAT_DATA" },
                dataSrc: "data"
            },
            columns: [
                { data: "c_name" }
            ],
            rowCallback: function (row, data, i) {
                renderCategoryRow($(row), data);
            }
        });

        /**
         * Recursively render a category row (with children)
         */
        function renderCategoryRow($row, data) {
            var $td = $row.find("td").first();

            // Build HTML for current row
            var html = `
                <div class="row w-100 align-items-center">
                    <div class="col-lg-6">
                        <b>${data.sl}</b> 
                        ${data.children && data.children.length > 0 ? `<span class="btn btn-sm btn-outline-primary expandable-table-caret">
                            <i class="fas fa-caret-right fa-fw"></i>
                        </span>` : ''}
                        ${data.c_name}
                    </div>
                    <div class="col-lg-2">${data.wgt}g</div>
                    <div class="col-lg-4 text-right">
                        ${data.add_new}
                        ${data.edit}
                        ${data.delete}
                    </div>
                </div>
            `;
            $td.html(html);

            // ✅ Compile current row so Angular binds ng-click
            $compile($td.contents())($scope);

            // Handle children recursively
            if (data.children && data.children.length > 0) {
                var $childContainer = $(`
                    <div class="child-container d-none pl-3 w-100">
                        <table class="table w-100 table-hover mb-0 child-table">
                            <tbody></tbody>
                        </table>
                    </div>
                `);
                $td.append($childContainer);
                var $childTbody = $childContainer.find("tbody");

                // Render each child row
                data.children.forEach(function (child) {
                    var $tr = $("<tr><td></td></tr>");
                    $childTbody.append($tr);
                    renderCategoryRow($tr, child); // recursion
                });

                // Expand/collapse caret
                var $caret = $td.find(".expandable-table-caret").first();
                $caret.on("click", function (e) {
                    e.stopPropagation();
                    $childContainer.toggleClass("d-none");
                    $(this).find("i").toggleClass("fa-caret-right fa-caret-down");
                });
            }
        }

        // 🔹 Open Add Category modal
        $scope.openAddCategoryModal = function (category) {
            if (!category) return;

            let categoryName = category.c_name;
            let categoryId = category.id;

            categoryAddModal($scope, { categoryName, id: categoryId });
        };

        // 🔹 Edit/Delete buttons using jQuery delegation
        $(document).delegate(".btn-edit", "click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            var id = $(this).data('id');
            $scope.category = { id: id };
            categoryEditModal($scope);
        });

        $(document).delegate(".btn-del", "click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            var id = $(this).data('id');
            $scope.category = { id: id };
            categoryDeleteModal($scope);
        });
    }
]);