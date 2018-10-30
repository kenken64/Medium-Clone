import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../shared/services/article.service';
import { Article } from '../../shared/models/article';
import { Router,ActivatedRoute } from '@angular/router';
import { SecurityService } from '../../shared/services/security.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  articles: Article[] = [];
  articleSortOrder: boolean;
  constructor(private articleSvc: ArticleService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: SecurityService
    ) {
        this.route.params.subscribe(params => {
            console.log("PARAMS" + params)
            console.log("RESET ID " + params.resetId)
            if(typeof(params.resetId) !== 'undefined'){
                this.userService.isResetIdValid(params.resetId).subscribe((result)=>{
                    console.log(result);
                    if(result.exist){
                        this.router.navigate(['/ResetChngPassword'])
                    }else{
                        this.router.navigate(['/Article'])
                    }
                })
            }else{
                this.router.navigate(['/Article'])
            }
        }); 
   }

  ngOnInit() {
    this.articleSvc.getArticles().subscribe((result)=>{
      this.articles = result;
      this.sortArticle(p=> p.publish_date, "DESC");
    });
  }

  sortArticle<T>(prop: (c: Article) => T, order: "ASC" | "DESC"): void {
    this.articles.sort((a, b) => {
        if (prop(a) < prop(b))
            return -1;
        if (prop(a) > prop(b))
            return 1;
        return 0;
    });

    if (order === "DESC") {
        this.articles.reverse();
        this.articleSortOrder = true;
    } else {
        this.articleSortOrder = false;
    }        
}

}
