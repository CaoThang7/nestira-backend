import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  SearchService,
  SearchSuggestionResponse,
  ProductSearchResponse,
} from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // API for getting category suggestions when user clicks on search input
  @Get('suggestions')
  async getCategorySuggestions(
    @Query('q') query?: string,
  ): Promise<SearchSuggestionResponse> {
    return this.searchService.getCategorySuggestions(query);
  }

  // API for searching products by keyword
  @Get('products')
  async searchProducts(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<ProductSearchResponse> {
    return this.searchService.searchProducts(query, page, limit);
  }

  // API for getting products by category
  @Get('category/:id/products')
  async getProductsByCategory(
    @Param('id', ParseIntPipe) categoryId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<ProductSearchResponse> {
    return this.searchService.getProductsByCategory(categoryId, page, limit);
  }

  // API for advanced search with multiple filters
  @Get('advanced')
  async advancedSearch(
    @Query('q') query?: string,
    @Query('categoryId', new DefaultValuePipe(null)) categoryId?: number,
    @Query('minPrice', new DefaultValuePipe(null)) minPrice?: number,
    @Query('maxPrice', new DefaultValuePipe(null)) maxPrice?: number,
    @Query('brand') brand?: string,
    @Query('color') color?: string,
    @Query('size') size?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ): Promise<ProductSearchResponse> {
    return this.searchService.advancedSearch({
      query,
      categoryId: categoryId ? Number(categoryId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      brand,
      color,
      size,
      page,
      limit,
    });
  }
}
