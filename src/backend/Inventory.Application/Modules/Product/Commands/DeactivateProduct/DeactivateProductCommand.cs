using Inventory.Application.Common.Interfaces;
using Inventory.Shared.Results;

namespace Inventory.Application.Modules.Product.Commands.DeactivateProduct;

public record DeactivateProductCommand(Guid Id) : ICommand<Result>;
