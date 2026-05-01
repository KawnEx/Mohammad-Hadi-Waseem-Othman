$(document).ready(function () {
    // 1. Show/Hide details subsection logic
    $('.toggle-details-btn').click(function () {
        var mealId = $(this).data('id');
        var detailsRow = $('#details-' + mealId);

        if (detailsRow.is(':visible')) {
            detailsRow.hide();
            $(this).text('Show Details');
            $(this).closest('tr').removeClass('expanded');
        } else {
            detailsRow.show();
            $(this).text('Hide Details');
            $(this).closest('tr').addClass('expanded');
        }
    });

    // Handle checkboxes and Continue button state
    function updateContinueButton() {
        var selectedCount = $('.select-checkbox:checked').length;
        if (selectedCount > 0) {
            $('#continue-btn').prop('disabled', false);
        } else {
            $('#continue-btn').prop('disabled', true);
            // Also hide the form if no meals are selected anymore
            $('#order-form-section').fadeOut();
        }
    }

    $('.select-checkbox').change(function () {
        updateContinueButton();
    });

    // 2. Click "Continue" button -> Show form section
    $('#continue-btn').click(function () {
        var selectedCount = $('.select-checkbox:checked').length;
        if (selectedCount === 0) {
            alert('Please select at least one meal to continue.');
            return;
        }
        $('#order-form-section').fadeIn();
        $('html, body').animate({
            scrollTop: $("#order-form-section").offset().top - 100
        }, 800);
    });

    // 3. Validation Logic
    $('#order-form').submit(function (e) {
        e.preventDefault();

        // Clear previous error messages and classes
        $('.form-group').removeClass('has-error');
        $('.error-msg').hide();

        var isValid = true;

        // --- National ID Validation (MANDATORY) ---
        var nationalId = $('#national-id').val().trim();
        if (nationalId === '') {
            $('#national-id-error').text('National ID is mandatory.').show();
            $('#national-id').closest('.form-group').addClass('has-error');
            isValid = false;
        } else {
            // Must be exactly 11 digits, first two must be between 01 and 14
            var idRegex = /^(0[1-9]|1[0-4])\d{9}$/;
            if (!idRegex.test(nationalId)) {
                $('#national-id-error').text('Must be 11 digits, and first two digits between 01 and 14.').show();
                $('#national-id').closest('.form-group').addClass('has-error');
                isValid = false;
            }
        }

        // --- Full Name Validation ---
        var fullName = $('#full-name').val().trim();
        if (fullName !== '') {
            // Arabic letters and spaces only
            var nameRegex = /^[\u0600-\u06FF\s]+$/;
            if (!nameRegex.test(fullName)) {
                $('#full-name-error').text('Name must contain Arabic letters only.').show();
                $('#full-name').closest('.form-group').addClass('has-error');
                isValid = false;
            }
        }

        // --- Date of Birth Validation ---
        var dob = $('#dob').val().trim();
        if (dob !== '') {
            // Format: dd-mm-yyyy
            var dobRegex = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-(19\d\d|20\d\d)$/;
            if (!dobRegex.test(dob)) {
                $('#dob-error').text('Must match the format dd-mm-yyyy.').show();
                $('#dob').closest('.form-group').addClass('has-error');
                isValid = false;
            }
        }

        // --- Mobile Number Validation ---
        var mobile = $('#mobile').val().trim();
        if (mobile !== '') {
            // Must match Syriatel/MTN prefix (093, 094, 095, 096, 098, 099) + 7 digits
            var mobileRegex = /^09(3|4|5|6|8|9)\d{7}$/;
            if (!mobileRegex.test(mobile)) {
                $('#mobile-error').text('Must match a valid Syriatel or MTN number (10 digits starting with 09x).').show();
                $('#mobile').closest('.form-group').addClass('has-error');
                isValid = false;
            }
        }

        // --- Email Validation ---
        var email = $('#email').val().trim();
        if (email !== '') {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                $('#email-error').text('Please enter a valid email address.').show();
                $('#email').closest('.form-group').addClass('has-error');
                isValid = false;
            }
        }

        // If validation succeeds -> Proceed to display Order Summary Overlay
        if (isValid) {
            displayOrderSummary();
        }
    });

    // 4. Final Order Summary Display
    function displayOrderSummary() {
        var selectedMeals = [];
        var totalPrice = 0;

        $('.select-checkbox:checked').each(function () {
            var row = $(this).closest('tr');
            var id = row.find('td:nth-child(1)').text();
            var name = row.find('td:nth-child(2)').text();
            var price = parseFloat(row.find('td:nth-child(3)').data('price'));

            selectedMeals.push({
                id: id,
                name: name,
                price: price
            });

            totalPrice += price;
        });

        var tax = totalPrice * 0.05;
        var finalTotal = totalPrice + tax;

        // Build HTML for the meals list inside the summary
        var mealsSummaryHtml = '';
        selectedMeals.forEach(function (meal) {
            mealsSummaryHtml += `
                <div class="summary-item">
                    <span>${meal.name} (${meal.id})</span>
                    <span>$${meal.price.toFixed(2)}</span>
                </div>
            `;
        });

        // Add pricing breakdown
        mealsSummaryHtml += `
            <div class="summary-item">
                <span>Subtotal</span>
                <span>$${totalPrice.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Tax (5%)</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-item total">
                <span>Final Total Amount</span>
                <span>$${finalTotal.toFixed(2)}</span>
            </div>
        `;

        // Fill modal content and display it
        $('#summary-items-container').html(mealsSummaryHtml);
        $('#summary-overlay').addClass('active');
    }

    // Modal Close logic
    $('#close-summary-btn').click(function () {
        $('#summary-overlay').removeClass('active');
    });

    // Initialize state
    updateContinueButton();
});
